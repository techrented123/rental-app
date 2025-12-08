"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: "us-west-2",
    credentials: process.env.NEXT_PUBLIC_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_ACCESS_KEY_SECRET || "",
        }
        : undefined,
});

const docClient = DynamoDBDocumentClient.from(client);

export interface RentReport {
    userId: string;
    userSub: string;
    name: string; 
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    addressChanged: boolean;
    paymentDate: string;
    rentAmount: number;
    status: "Reported" | "Not Reported";
    createdAt?: string;
    city?: string;
    state?: string;
}

interface FetchRentReportsParams {
    page?: number;
    pageSize?: number;
    month?: string; // Format: YYYY-MM
    search?: string;
    status?: "all" | "reported" | "not-reported";
}

export async function fetchRentReportsAction({
    page = 1,
    pageSize = 50,
    month,
    search,
    status = "all",
}: FetchRentReportsParams) {
    try {

        const command = new ScanCommand({
            TableName: "RentReports",
        });

        const response = await docClient.send(command);
        let items = (response.Items || []) as RentReport[];

        // Calculate Global Stats (before filtering)
        const uniqueUsers = new Set(items.map((r) => r.userSub));
        const totalUsers = uniqueUsers.size;

        const currentDate = new Date();
        const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

        const totalReportsThisMonth = items.filter((r) => {
            const d = new Date(r.paymentDate || r.createdAt || new Date());
            const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            return m === currentMonthStr && r.status === "Reported";
        }).length;

        // 1. Filter by Month/Year
        if (month) {
            items = items.filter((item) => {
                const date = new Date(item.paymentDate || item.createdAt || new Date());
                const itemMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                return itemMonth === month;
            });
        }

        // 2. Filter by Status
        if (status !== "all") {
            const targetStatus = status === "reported" ? "Reported" : "Not Reported";
            items = items.filter((item) => item.status === targetStatus);
        }

        // 3. Search Filter
        if (search) {
            const searchLower = search.toLowerCase();
            items = items.filter((item) => {
                const nameMatch = item.name?.toLowerCase().includes(searchLower);
                const emailMatch = item.email?.toLowerCase().includes(searchLower);
                const phoneMatch = item.phone?.toLowerCase().includes(searchLower);
                const cityMatch = item.city?.toLowerCase().includes(searchLower);
                const stateMatch = item.state?.toLowerCase().includes(searchLower);

                return nameMatch || emailMatch || phoneMatch || cityMatch || stateMatch;
            });
        }

        // 4. Sort by Date (newest first)
        items.sort((a, b) => {
            const dateA = new Date(a.paymentDate || a.createdAt || 0).getTime();
            const dateB = new Date(b.paymentDate || b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        // 5. Pagination
        const totalCount = items.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedItems = items.slice(startIndex, endIndex);

        return {
            success: true,
            data: {
                reports: paginatedItems,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    pageSize,
                },
                stats: {
                    totalUsers,
                    totalReportsThisMonth
                }
            },
        };
    } catch (error) {
        console.error("Error fetching rent reports:", error);
        return {
            success: false,
            error: "Failed to fetch rent reports",
        };
    }
}
