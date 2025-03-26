import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { ZoomMeetingClient } from "@/lib/zoom";

dotenv.config();
export async function POST(req: Request) {
  const client: ZoomMeetingClient = new ZoomMeetingClient();

  try {
    const { meetingId, password, quantity, duration, botNames } = await req.json();
    const meetingNo: string = "81592495432";
    const passwordM: string = "iY6Dcm";
    const username: string = "Bot";
    const userEmail: string = "ahadnawaz585@gmail.com";

    client.joinMeeting(username, meetingId, password, userEmail);
    let meetingDetails = { id: meetingId, join_url: "", password };

    return NextResponse.json({
      success: true,
      meetingId: meetingDetails.id,
      password: meetingDetails.password,
    });
    
  } catch (error) {
    console.error("Zoom API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process Zoom request" },
      { status: 500 }
    );
  }
}
