// module imports
import FormData from "form-data";
import axios from "axios";
import crypto from "crypto";
import fs from "fs";

// destructuring assignments
const { SUMSUB_APP_TOKEN, SUMSUB_SECRET_KEY, SUMSUB_BASE_URL } = process.env;

// variable initializations
const config = { baseURL: SUMSUB_BASE_URL };

const instance = axios.create();
instance.interceptors.request.use(createSignature, function (error) {
  return Promise.reject(error);
});

/**
 * @description Create signature for the request
 * @param {Object} config request configuration
 * @returns {Object} request signature
 */
// https://developers.sumsub.com/api-reference/#app-tokens
function createSignature(config) {
  console.log("Creating a signature for the request...");

  const ts = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac("sha256", SUMSUB_SECRET_KEY || "");
  signature.update(ts + config.method.toUpperCase() + config.url);

  if (config.data instanceof FormData) {
    signature.update(config.data.getBuffer());
  } else if (config.data) {
    signature.update(config.data);
  }

  config.headers["X-App-Access-Ts"] = ts;
  config.headers["X-App-Access-Sig"] = signature.digest("hex");

  return config;
}

// This section contains requests to server using configuration functions
// The description of the flow can be found here: https://developers.sumsub.com/api-flow/#api-integration-phases
// Such actions are presented below:
// 1) Creating an applicant
// 2) Adding a document to the applicant
// 3) Getting applicant status
// 4) Getting access tokens for SDKs

class SumsubManager {
  constructor() {
    this.axios = axios;
    this.crypto = crypto;
    this.FormData = FormData;
    this.fs = fs;
  }

  externalUserId = "random-JSToken-" + Math.random().toString(36).substr(2, 9);
  levelName = "basic-kyc-level";

  /**
   * @description Create applicant
   * @param {String} externalUserId external user id
   * @param {String} levelName level name
   * @returns {Object} applicant
   */
  // https://developers.sumsub.com/api-reference/#creating-an-applicant
  async createApplicant(
    externalUserId = this.externalUserId,
    levelName = this.levelName
  ) {
    console.log("Creating an applicant...");

    const method = "post";
    const url = "/resources/applicants?levelName=" + levelName;

    const body = { externalUserId };

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-App-Token": SUMSUB_APP_TOKEN,
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = JSON.stringify(body);

    return (await instance(config))?.data;
  }

  /**
   * @description Get applicant status
   * @param {String} applicantId applicant id
   * @returns {Object} applicant status
   */
  // https://developers.sumsub.com/api-reference/#getting-applicant-status-sdk
  async getApplicantStatus(applicantId) {
    console.log("Getting the applicant status...");

    const method = "get";
    const url = `/resources/applicants/${applicantId}/status`;

    const headers = {
      Accept: "application/json",
      "X-App-Token": SUMSUB_APP_TOKEN,
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = null;

    return (await instance(config))?.data;
  }

  /**
   * @description Get applicant data
   * @param {String} applicantId applicant id
   * @returns {Object} applicant data
   */

  /**
   * @description Get applicant data
   * @param {String} applicantId applicant id
   * @returns {Object} applicant data
   */
  // https://developers.sumsub.com/api-reference/#getting-applicant-data
  async getApplicantData(applicantId) {
    console.log("Getting the applicant data...");

    const method = "get";
    const url = `/resources/applicants/${applicantId}/one`;

    const headers = {
      Accept: "application/json",
      "X-App-Token": SUMSUB_APP_TOKEN,
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = null;

    return (await axios(config))?.data;
  }

  /**
   * @description Create access token
   * @param {String} externalUserId external user id
   * @param {String} levelName level name
   * @param {String} ttlInSecs ttl in seconds
   * @returns {Object} access token
   */
  // https://developers.sumsub.com/api-reference/#access-tokens-for-sdks
  async createAccessToken(
    externalUserId = this.externalUserId,
    levelName = this.levelName,
    ttlInSecs = 600
  ) {
    console.log("Creating an access token for initializng SDK...");

    const method = "post";
    const url = `/resources/accessTokens?userId=${externalUserId}&ttlInSecs=${ttlInSecs}&levelName=${levelName}`;

    const headers = {
      Accept: "application/json",
      "X-App-Token": SUMSUB_APP_TOKEN,
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = null;

    return (await instance(config))?.data;
  }

  /**
   * @description Add document
   * @param {String} applicantId applicant id
   * @returns {Object} document
   */
  // https://developers.sumsub.com/api-reference/#adding-an-id-document
  async addDocument(applicantId) {
    console.log("Adding document to the applicant...");

    const method = "post";
    const url = `/resources/applicants/${applicantId}/info/idDoc`;
    const filePath = "resources/sumsub-logo.png";

    const metadata = {
      idDocType: "PASSPORT",
      country: "GBR",
    };

    const form = new FormData();
    form.append("metadata", JSON.stringify(metadata));

    const content = fs.readFileSync(filePath);
    form.append("content", content, filePath);

    /*
  In case you'd like to upload images in base64 encoded string format:
  
  const content = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABCUExURUxpcSMudAGjmiIwdiEtdSIwdCMxdSMwdSMwdQGmlyMvdSFPfQOnmCMvdSMwdSMwdQGjmiMwdQGjmgGjmiMwdQGjmlncPbUAAAAUdFJOUwAw5lQRH0PM8CGpBhC81eBrftK5jzDo3gAAAAlwSFlzAAABwAAAAcABl8K+3QAAAuRJREFUeNrtm9typCAURXFEdMRLm6T//1fnId4qfUKDomLNWo8pwLOq7WwP0koBAAAAAAAAAAD8xzz+BPJIq377DMbeXaBBAAEEEIhHc3eBR7hAEkn2+Bhz9bmBcerH41Z3flqZ3MQRaBBAAAEEEEAAAQQQQAABBO7QCV/YHc/978IzEi8LH9EnN89Tid8n/z1XoEEAAQQQuPTf6AHp/Hlm/Z8BhQ1d/4PSyDfRiYgFmLb8yaBU8fVKqZKkFUotVCb8tU9ToBNKzRBAAAEEEhQY0hQY3gkMWfGNSpSxvGyQBXp1G3pRoLuPQIcAAgggcCnlSsCWieevM5M7q5Qd802vBuSv3aeT1vjNXY8zodfIVwVmI7/sAeuvUFa3X+UaV0lp6ov2f+YIXnspzLoHeoqKFAgggAACCCQhUJvvGDRtHIF2Wq8+SWDO7yyOwFyYrU4RqIRHjl0C2vO2QgABBBDYL2CFYm10AXEjW+qq5n66XjpFt8DSF86p1Xqmc8imgzbf5J1bwI7jjJ074XdPCN3U4S5z3QJdPo7TagOZW0B5Zqi0itSPV+IbgF078p4C4dsAYote7bvzEUAAAQR2CvTRBaRMroVhebhALixT78tfVyavsK870Z3QMUuY9ZmldiQXkn1BqwMR89d5Re2byeegPb8hK/ZtmyOAAAII7BWokheo3VPqVAXm/H2XfUImJyFgd8xNQaAKn4wAAggggICJI5CfXnc9drNVHIGpO67NOfVLnfA+gZO74w3PoGk9WCOAAAIIXNsdb+iEJdojBUw9UrgF2vx1x9o7D6d30W+642KqJSCn9fzxlid0s2/Wm/2qLWen+9jPoO5vg1Rit+uwBwIIIIDAFQK293snHF3A+e64D0hLnY/YOZMXquMEqterGTvVsik1te9vkuIIxO+Tfc8vHidwwGEPBBBAAIHzBKzzN6d1HIE21olpZyZLRNqLta5rXPfyAAAAAAAAAAAAAH7nHygtt70j9IRfAAAAV3pUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAHic4/IMCHFWKCjKT8vMSeVSAAMjCy5jCxMjE0uTFAMTIESANMNkAyOzVCDL2NTIxMzEHMQHy4BIoEouAOoXEXTyQjWVAAAAAElFTkSuQmCC'
  const ext = content.substring("data:image/".length, content.indexOf(";base64"));
  const fileName = `image.${ext}`;
  const base64Data = content.split(',')[1];
  form.append('content', Buffer.from(base64Data, 'base64'), { fileName });
  */

    const headers = {
      Accept: "application/json",
      "X-App-Token": SUMSUB_APP_TOKEN,
    };

    config.method = method;
    config.url = url;
    config.headers = Object.assign(headers, form.getHeaders());
    config.data = form;

    return (await instance(config))?.data;
  }
}

export default SumsubManager;
