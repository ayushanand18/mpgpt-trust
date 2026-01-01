"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IdCard } from "lucide-react"

export function CreateUserAccount() {
    return (<Card className="md:col-span-2 border-black/50">
        <CardHeader>
            <CardTitle className="text-default">Register Account</CardTitle>
            <CardDescription>You are one step away from generating your Library ID. Click below to register this account with library and generate ID.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
                By registering and generating your Unique Member Id, you agree that all your data including bookings, credits, and personal information
                will be stored and processed under applicable laws and regulations.
            </p>
            <Button onClick={() => { }} variant="default" className="w-full sm:w-auto">
                <IdCard className="h-4 w-4 mr-2" />
                Generate Member ID
            </Button>
        </CardContent>
    </Card>)
}