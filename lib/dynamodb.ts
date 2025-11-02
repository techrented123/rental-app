import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import type { TrackingData } from "./tracking";

const AWS_REGION = process.env.NEXT_PUBLIC_REGION || "us-east-1";
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "UserTracking";

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: AWS_REGION,
  credentials: process.env.NEXT_PUBLIC_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY_ID,
        secretAccessKey: process.env.NEXT_PUBLIC_ACCESS_KEY_SECRET || "",
      }
    : undefined,
});

const docClient = DynamoDBDocumentClient.from(client);

/**
 * Store or update incomplete application tracking data
 */
export async function saveTrackingData(data: TrackingData): Promise<void> {
  try {
    const item = {
      sessionId: data.sessionId,
      step: data.step,
      lastActivity: data.lastActivity,
      email: data.email || null,
      name: data.name || null,
      address: data.address || null,
      location: data.location || null,
      ip: data.ip || null,
      source: data.source || "rental-application",
      property: data.property || null,
      createdAt: data.createdAt || Date.now(),
      userReminderSent: data.userReminderSent || false,
      salesAlertSent: data.salesAlertSent || false,
      ttl: Math.floor(Date.now() / 1000) + 2592000, // 30 days from now
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );
  } catch (error) {
    console.error("Error saving tracking data to DynamoDB:", error);
    throw error;
  }
}

/**
 * Get tracking data by session ID
 */
export async function getTrackingData(
  sessionId: string
): Promise<TrackingData | null> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { sessionId },
      })
    );

    if (!result.Item) return null;

    return result.Item as TrackingData;
  } catch (error) {
    console.error("Error getting tracking data from DynamoDB:", error);
    return null;
  }
}

/**
 * Get all incomplete applications
 */
export async function getAllIncompleteApplications(): Promise<TrackingData[]> {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    return (result.Items || []) as TrackingData[];
  } catch (error) {
    console.error("Error getting all incomplete applications:", error);
    return [];
  }
}

/**
 * Update tracking data (e.g., mark as notified)
 */
export async function updateTrackingData(
  sessionId: string,
  updates: Partial<TrackingData>
): Promise<void> {
  try {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value], index) => {
      const nameKey = `#${key}`;
      const valueKey = `:val${index}`;
      updateExpression.push(`${nameKey} = ${valueKey}`);
      expressionAttributeNames[nameKey] = key;
      expressionAttributeValues[valueKey] = value;
    });

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { sessionId },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
  } catch (error) {
    console.error("Error updating tracking data in DynamoDB:", error);
    throw error;
  }
}

/**
 * Delete tracking data (when application is completed)
 */
export async function deleteTrackingData(sessionId: string): Promise<void> {
  try {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { sessionId },
      })
    );
  } catch (error) {
    console.error("Error deleting tracking data from DynamoDB:", error);
    throw error;
  }
}
