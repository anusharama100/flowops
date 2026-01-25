'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/auth-context'
import { store } from '@/lib/data/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import type { RequestType, FieldSchema, Priority } from '@/types'
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

export default function CreateRequestFormPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [requestType, setRequestType] = useState<RequestType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)

  const typeId = params.typeId as string

  useEffect(() => {
    if (user && typeId) {
      const type = store.getRequestType(typeId)
      if (type) {
        setRequestType(type)
      } else {
        router.push('/requests/new')
      }
      setIsLoading(false)
    }
  }, [user, typeId, router])

  // Build dynamic Zod schema based on request type fields
  const buildSchema = useCallback((fields: FieldSchema[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {
      title: z.string().min(5, 'Title must be at least 5 characters'),
      description: z.string().min(10, 'Description must be at least 10 characters'),
      priority: z.enum(['low', 'medium', 'high', 'critical']),
    }

    fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny

      switch (field.type) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'url':
          fieldSchema = z.string()
          if (field.validation?.minLength) {
            fieldSchema = (fieldSchema as z.ZodString).min(field.validation.minLength, `Must be at least ${field.validation.minLength} characters`)
          }
          if (field.validation?.maxLength) {
            fieldSchema = (fieldSchema as z.ZodString).max(field.validation.maxLength, `Must be at most ${field.validation.maxLength} characters`)
          }
          if (field.type === 'email') {
            fieldSchema = (fieldSchema as z.ZodString).email('Invalid email address')
          }
          if (field.type === 'url') {
            fieldSchema = (fieldSchema as z.ZodString).url('Invalid URL')
          }
          break
        case 'number':
          fieldSchema = z.coerce.number()
          if (field.validation?.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).min(field.validation.min)
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).max(field.validation.max)
          }
          break
        case 'select':
          fieldSchema = z.string()
          break
        case 'multiselect':
          fieldSchema = z.array(z.string())
          break
        case 'checkbox':
          fieldSchema = z.boolean()
          break
        case 'date':
          fieldSchema = z.string()
          break
        case 'file':
          fieldSchema = z.any()
          break
        default:
          fieldSchema = z.string()
      }

      if (!field.required) {
        fieldSchema = fieldSchema.optional()
      }

      schemaFields[field.name] = fieldSchema
    })

    return z.object(schemaFields)
  }, [])

  const schema = requestType ? buildSchema(requestType.fields) : z.object({})

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      priority: requestType?.defaultPriority || 'medium',
    },
  })

  const watchedValues = watch()

  // Check conditional visibility
  const isFieldVisible = useCallback((field: FieldSchema) => {
    if (!field.conditionalVisibility) return true

    const { fieldId, operator, value } = field.conditionalVisibility
    const fieldValue = (watchedValues as Record<string, unknown>)[fieldId]

    switch (operator) {
      case 'equals':
        return fieldValue === value
      case 'not_equals':
        return fieldValue !== value
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(value)
      case 'not_empty':
        return fieldValue !== undefined && fieldValue !== '' && fieldValue !== null
      default:
        return true
    }
  }, [watchedValues])

  // Autosave draft
  useEffect(() => {
    if (!requestType || !isDirty) return

    const autosaveTimer = setTimeout(() => {
      const values = getValues()
      if (typeof window !== 'undefined') {
        localStorage.setItem(`flowops_draft_${typeId}`, JSON.stringify(values))
      }
    }, 2000)

    return () => clearTimeout(autosaveTimer)
  }, [watchedValues, isDirty, typeId, requestType, getValues])

  // Load draft on mount
  useEffect(() => {
    if (requestType && typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(`flowops_draft_${typeId}`)
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft)
          Object.entries(draftData).forEach(([key, value]) => {
            setValue(key as any, value as any)
          })
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [requestType, typeId, setValue])

  const handleSaveDraft = async () => {
    if (!user || !requestType) return

    setIsSaving(true)
    try {
      const rawValues = getValues()
      const values = rawValues as Record<string, unknown>
      const formData: Record<string, unknown> = {}
      
      requestType.fields.forEach((field) => {
        if (values[field.name] !== undefined) {
          formData[field.name] = values[field.name]
        }
      })

      if (draftId) {
        store.updateRequest(draftId, {
          title: rawValues.title,
          description: rawValues.description,
          priority: rawValues.priority as Priority,
          formData,
        }, user.id)
      } else {
        const newRequest = store.createRequest({
          title: rawValues.title,
          description: rawValues.description,
          priority: rawValues.priority as Priority,
          requestTypeId: requestType.id,
          category: requestType.category,
          formData,
        }, user.id)
        setDraftId(newRequest.id)
      }

      // Clear localStorage draft
      localStorage.removeItem(`flowops_draft_${typeId}`)

      toast({
        title: 'Draft saved',
        description: 'Your request has been saved as a draft.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onSubmit = async (data: any) => {
    if (!user || !requestType) return

    setIsSubmitting(true)
    try {
      const formData: Record<string, unknown> = {}
      
      requestType.fields.forEach((field) => {
        if (data[field.name] !== undefined) {
          formData[field.name] = data[field.name]
        }
      })

      let requestId = draftId

      if (requestId) {
        store.updateRequest(requestId, {
          title: data.title,
          description: data.description,
          priority: data.priority as Priority,
          formData,
        }, user.id)
      } else {
        const newRequest = store.createRequest({
          title: data.title,
          description: data.description,
          priority: data.priority as Priority,
          requestTypeId: requestType.id,
          category: requestType.category,
          formData,
        }, user.id)
        requestId = newRequest.id
      }

      // Submit the request
      store.submitRequest(requestId, user.id)

      // Clear localStorage draft
      localStorage.removeItem(`flowops_draft_${typeId}`)

      toast({
        title: 'Request submitted',
        description: requestType.approvalRequired 
          ? 'Your request has been submitted for approval.'
          : 'Your request has been submitted successfully.',
        variant: 'success',
      })

      router.push(`/requests/${requestId}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading) {
    return <FormSkeleton />
  }

  if (!requestType) {
    return null
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/requests/new">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">{requestType.name}</h1>
          <p className="text-slate-500 mt-1">{requestType.description}</p>
        </div>
        {requestType.approvalRequired && (
          <Badge variant="outline" className="shrink-0">
            Requires Approval
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Details</CardTitle>
            <CardDescription>Provide a summary of your request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of your request"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide more details about your request..."
                rows={4}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Fields Card */}
        {requestType.fields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <CardDescription>Please fill in the required fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requestType.fields
                .filter(isFieldVisible)
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <DynamicField
                    key={field.id}
                    field={field}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  )
}

interface DynamicFieldProps {
  field: FieldSchema
  register: any
  control: any
  errors: any
}

function DynamicField({ field, register, control, errors }: DynamicFieldProps) {
  const error = errors[field.name]

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </Label>

      {field.type === 'text' && (
        <Input
          id={field.name}
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      )}

      {field.type === 'email' && (
        <Input
          id={field.name}
          type="email"
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      )}

      {field.type === 'url' && (
        <Input
          id={field.name}
          type="url"
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      )}

      {field.type === 'number' && (
        <Input
          id={field.name}
          type="number"
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      )}

      {field.type === 'textarea' && (
        <Textarea
          id={field.name}
          placeholder={field.placeholder}
          rows={4}
          {...register(field.name)}
        />
      )}

      {field.type === 'select' && (
        <Controller
          name={field.name}
          control={control}
          render={({ field: controllerField }) => (
            <Select value={controllerField.value || ''} onValueChange={controllerField.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}

      {field.type === 'checkbox' && (
        <Controller
          name={field.name}
          control={control}
          render={({ field: controllerField }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id={field.name}
                checked={controllerField.value || false}
                onCheckedChange={controllerField.onChange}
              />
              <Label htmlFor={field.name} className="font-normal">
                {field.helperText || field.label}
              </Label>
            </div>
          )}
        />
      )}

      {field.type === 'date' && (
        <Input
          id={field.name}
          type="date"
          {...register(field.name)}
        />
      )}

      {field.type === 'file' && (
        <Input
          id={field.name}
          type="file"
          {...register(field.name)}
        />
      )}

      {field.helperText && field.type !== 'checkbox' && (
        <p className="text-sm text-slate-500">{field.helperText}</p>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error.message as string}
        </p>
      )}
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
