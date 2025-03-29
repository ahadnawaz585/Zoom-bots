import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Interface for Zoom Rooms Join Request Body
interface ZoomRoomsJoinParams {
  meeting_number: string | number;
  password: string;
  force_accept?: boolean;
  callback_url?: string;
}

// Interface for Zoom Rooms API Response (simplified)
interface ZoomRoomsResponse {
  jsonrpc: string;
  result?: {
    meeting_number: number;
    status: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

export class ZoomMeetingJoiner {
  private axiosInstance: AxiosInstance;
  private accessToken: string;
  private baseUrl: string = 'https://api.zoom.us/v2';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Joins a Zoom Room into a meeting using the Zoom Rooms API
   * @param roomId The ID of the Zoom Room
   * @param meetingNumber The Meeting ID (e.g., "84959608872")
   * @param password The meeting password (e.g., "Qbe2pq")
   * @returns Promise resolving to the API response
   * @throws Error if the request fails
   */
  public async joinZoomRoomMeeting(
    roomId: string,
    meetingNumber: string,
    password: string
  ): Promise<ZoomRoomsResponse> {
    const requestBody = {
      jsonrpc: '2.0',
      method: 'join',
      params: {
        meeting_number: meetingNumber,
        password,
        force_accept: false, // Set to true if you want to bypass waiting room
        callback_url: 'https://your-app.com/callback' // Optional callback URL
      },
    };

    try {
      const response: AxiosResponse<ZoomRoomsResponse> = await this.axiosInstance.post(
        `/rooms/${roomId}/meetings`,
        requestBody
      );

      const responseData = response.data;
      if (responseData.error) {
        throw new Error(`Zoom Rooms API error: ${responseData.error.message} (Code: ${responseData.error.code})`);
      }

      console.log(`Zoom Room ${roomId} joining meeting ${meetingNumber}: ${responseData.result?.status}`);
      return responseData;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const zoomError = error.response.data.error;
        throw new Error(
          `Failed to join meeting: ${zoomError?.message || 'Unknown error'} (Code: ${zoomError?.code || 'N/A'})`
        );
      }
      throw new Error(`Failed to join meeting: ${error.message}`);
    }
  }
}