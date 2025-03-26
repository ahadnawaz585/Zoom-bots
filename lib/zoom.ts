import { ZoomMtg } from "@zoom/meetingsdk";
import { SignJWT } from "jose";
import { KJUR } from 'jsrsasign'
// Function to initialize Zoom SDK
const initializeZoomSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window object is not available"));
      return;
    }

    ZoomMtg.setZoomJSLib("https://source.zoom.us/2.18.0/lib", "/av");
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const checkReady = setInterval(() => {
      if (ZoomMtg.checkFeatureRequirements()) {
        // Check if a known method is available
        clearInterval(checkReady);
        resolve();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkReady);
      reject(new Error("Zoom SDK failed to initialize within 10 seconds"));
    }, 10000);
  });
};

interface JWTPayload {
  sdkKey: string;
  exp: number;
  mn?: string;
  role?: number;
}

export class ZoomMeetingClient {
  private sdkKey: string;
  private initialized: boolean = false;

  constructor() {
    this.sdkKey = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID || "";
    if (!this.sdkKey) {
      throw new Error("NEXT_PUBLIC_ZOOM_CLIENT_ID is not defined");
    }
  }

  async initialize() {
    if (!this.initialized) {
      await initializeZoomSDK();
      this.initialized = true;
    }
  }


  async generateSignature(
    meetingNumber: string | number,
    role: number,
    expirationSeconds?: number
  ) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2; // Default 2 hours

    const oHeader = { alg: "HS256", typ: "JWT" };

    const oPayload = {
      appKey: process.env.ZOOM_MEETING_SDK_KEY,
      sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
      mn: meetingNumber,
      role,
      iat,
      exp,
      tokenExp: exp,
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);

    return KJUR.jws.JWS.sign(
      "HS256",
      sHeader,
      sPayload,
      process.env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET
    );
  }

  async joinMeeting(
    userName: string,
    meetingNumber: string,
    password: string,
    userEmail: string
  ): Promise<void> {
    try {
      // Ensure SDK is initialized before proceeding
      await this.initialize();

      console.log("Joining meeting with:", {
        userName,
        meetingNumber,
        userEmail,
      });
      const signature = await this.generateSignature(meetingNumber,0,120);
      console.log("Generated signature:", signature);

      return new Promise((resolve, reject) => {
        console.log("Initializing ZoomMtg.join...");
        ZoomMtg.init({
          leaveUrl: "http://localhost:3000",
          patchJsMedia: true,
          leaveOnPageUnload: true,
          success: (success: unknown) => {
            console.log(success);
            // can this be async?
            ZoomMtg.join({
              signature: signature,
              sdkKey: this.sdkKey,
              meetingNumber: meetingNumber,
              passWord: password,
              userName: userName,
              userEmail: userEmail,
              // tk: registrantToken,
              // zak: zakToken,
              success: (success: unknown) => {
                console.log(success);
              },
              error: (error: unknown) => {
                console.log(error);
              },
            });
          },
          error: (error: unknown) => {
            console.log(error);
          },
        });

        // ZoomMtg.join({
        //   signature,
        //   meetingNumber,
        //   userName,
        //   sdkKey: this.sdkKey,
        //   userEmail,
        //   passWord: password,
        //   success: (joinSuccess: any) => {
        //     console.log("Join meeting success:", joinSuccess);
        //     resolve();
        //   },
        //   error: (joinError: any) => {
        //     console.error("Join meeting error:", joinError);
        //     reject(joinError);
        //   },
        // });
      });
    } catch (error) {
      console.error("Zoom meeting join error:", error);
      throw error;
    }
  }
}
