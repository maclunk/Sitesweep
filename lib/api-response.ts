import { NextResponse } from 'next/server'

export interface ApiError {
  error: string
  code?: string
  details?: any
}

export interface ApiSuccess<T = any> {
  data: T
  message?: string
}

export function successResponse<T>(data: T, message?: string, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    } as ApiSuccess<T>,
    { status }
  )
}

export function errorResponse(
  error: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(code && { code }),
      ...(details && { details }),
    } as ApiError,
    { status }
  )
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, 401, 'UNAUTHORIZED')
}

export function notFoundResponse(message: string = 'Resource not found'): NextResponse {
  return errorResponse(message, 404, 'NOT_FOUND')
}

export function serverErrorResponse(
  message: string = 'Internal server error',
  details?: any
): NextResponse {
  return errorResponse(message, 500, 'INTERNAL_ERROR', details)
}

