import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const AWS_REGION = process.env.NEXT_PUBLIC_REGION || "us-east-1";
const TABLE_NAME = "RentalApplicationTracking";

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

export interface ApplicationTrackingData {
    email?: string;
    step?: number;
    data?: Record<string, any>;
    signature?: boolean;
    property?: string;
    verification_report_url?: string;
    rentalInfo?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
    sessionId?: string;
}

/**
 * Store application tracking data
 */
export async function saveApplicationStep(data: ApplicationTrackingData): Promise<void> {
    try {
        const now = new Date().toISOString();
        console.log("Saving application tracking data:", data);

        let email = data.email;

        // If email is missing but we have sessionId, try to find the email
        if (!email && data.sessionId) {
            try {
                // We need to find the item with this sessionId to get the PK (email)
                // Since we don't know if sessionId is indexed, we'll use a Scan (not efficient for large tables but works here)
                // If there is a GSI, we should use Query, but we don't have the index name.
                const scanResult = await docClient.send(
                    new ScanCommand({
                        TableName: TABLE_NAME,
                        FilterExpression: "sessionId = :sessionId",
                        ExpressionAttributeValues: {
                            ":sessionId": data.sessionId,
                        },
                        ProjectionExpression: "email",
                    })
                );

                if (scanResult.Items && scanResult.Items.length > 0) {
                    email = scanResult.Items[0].email;
                    console.log("Found email for sessionId:", email);
                } else {
                    console.warn("No record found for sessionId:", data.sessionId);
                    // If not found, we can't update. We might need to create a new one if we had an email, but we don't.
                    return;
                }
            } catch (err) {
                console.error("Error scanning for sessionId:", err);
                throw err;
            }
        }

        if (!email) {
            console.error("Cannot update DynamoDB: Email (PK) is missing and could not be found via sessionId");
            return;
        }

        const updateExpressionParts: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        // Helper to add fields to update
        const addUpdate = (key: string, value: any, dbKey?: string) => {
            if (value !== undefined && value !== null) {
                const attrName = `#${key}`;
                const attrVal = `:val_${key}`;
                updateExpressionParts.push(`${attrName} = ${attrVal}`);
                expressionAttributeNames[attrName] = dbKey || key;
                expressionAttributeValues[attrVal] = value;
            }
        };

        // Don't update email as it is the key
        addUpdate("step", data.step);
        addUpdate("data", data.data);
        addUpdate("signature", data.signature);
        addUpdate("property", data.property);
        addUpdate("verification_report_url", data.verification_report_url);
        addUpdate("rentalInfo", data.rentalInfo);
        addUpdate("updatedAt", now);
        addUpdate("sessionId", data.sessionId); // Ensure sessionId is set/updated if provided

        // Ensure createdAt is set if it's a new item (upsert behavior)
        // DynamoDB UpdateItem can set if_not_exists
        updateExpressionParts.push("#createdAt = if_not_exists(#createdAt, :createdAt)");
        expressionAttributeNames["#createdAt"] = "createdAt";
        expressionAttributeValues[":createdAt"] = data.createdAt || now;


        const updateExpression = `SET ${updateExpressionParts.join(", ")}`;

        console.log("Update Expression:", updateExpression);

        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { email: email }, // Use email as the Key
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
            })
        );
        console.log("Successfully updated DynamoDB");
    } catch (error) {
        console.error("Error saving application tracking data to DynamoDB:", error);
        throw error;
    }
}

/**
 * Delete application tracking data by sessionId or email
 */
export async function deleteApplicationTracking(sessionId?: string, email?: string): Promise<void> {
    try {
        let emailToDelete = email;

        // If email is not provided but sessionId is, find the email first
        if (!emailToDelete && sessionId) {
            const scanResult = await docClient.send(
                new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: "sessionId = :sessionId",
                    ExpressionAttributeValues: {
                        ":sessionId": sessionId,
                    },
                    ProjectionExpression: "email",
                })
            );

            if (scanResult.Items && scanResult.Items.length > 0) {
                emailToDelete = scanResult.Items[0].email;
                console.log("Found email for deletion:", emailToDelete);
            } else {
                console.warn("No record found for sessionId:", sessionId);
                return;
            }
        }

        if (!emailToDelete) {
            console.error("Cannot delete: Email (PK) is required");
            return;
        }

        await docClient.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { email: emailToDelete },
            })
        );

        console.log("Successfully deleted application tracking data for:", emailToDelete);
    } catch (error) {
        console.error("Error deleting application tracking data from DynamoDB:", error);
        throw error;
    }
}

/**
 * Get application tracking data by sessionId
 */
export async function getApplicationTracking(sessionId: string): Promise<ApplicationTrackingData | null> {
    try {
        const scanResult = await docClient.send(
            new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "sessionId = :sessionId",
                ExpressionAttributeValues: {
                    ":sessionId": sessionId,
                },
            })
        );

        if (scanResult.Items && scanResult.Items.length > 0) {
            console.log("Found application tracking data for sessionId:", sessionId);
            return scanResult.Items[0] as ApplicationTrackingData;
        }

        console.warn("No application tracking data found for sessionId:", sessionId);
        return null;
    } catch (error) {
        console.error("Error getting application tracking data from DynamoDB:", error);
        return null;
    }
}
