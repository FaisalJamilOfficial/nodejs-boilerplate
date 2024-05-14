// module imports
import { OAuth2Client } from "google-auth-library";

// destructuring assignments
const { GOOGLE_CLIENT_ID } = process.env;

// variable initializations
const client = new OAuth2Client(GOOGLE_CLIENT_ID); // Your Google OAuth client ID

class GoogleAuthenticator {
  constructor() {
    this.client = client;
  }

  /**
   * @description Verify google id token
   * @param {String} idToken google id token
   * @returns {Object} response
   */
  async verifyIdToken(idToken) {
    // Verify the ID token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID, // Your client ID
    });
    return ticket.getPayload();
  }
}

export default GoogleAuthenticator;
