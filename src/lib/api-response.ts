import { NextResponse } from 'next/server'

/**
 * Standardized API response helpers
 */

export const ApiResponse = {
  /**
   * Success response with data
   */
  success: <T>(data: T, status: number = 200) => {
    return NextResponse.json(data, { status })
  },

  /**
   * Created response (201)
   */
  created: <T>(data: T) => {
    return NextResponse.json(data, { status: 201 })
  },

  /**
   * No content response (204)
   */
  noContent: () => {
    return new NextResponse(null, { status: 204 })
  },

  /**
   * Success response with message
   */
  message: (message: string, status: number = 200) => {
    return NextResponse.json({ message }, { status })
  }
}
