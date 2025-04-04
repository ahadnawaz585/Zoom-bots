import React from 'react';
import { Calendar, Clock, Users, Globe, Play, X, Trash2, UserCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Bot {
  id: number;
  name: string;
  status: string;
  countryCode: string;
}

interface UpcomingMeeting {
  id: string;
  meetingId: string;
  password: string;
  quantity: number;
  duration: number;
  countryCode: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'cancelled';
  bots: Bot[];
}

interface UpcomingMeetingsProps {
  meetings: UpcomingMeeting[];
  onJoinMeeting: (meeting: UpcomingMeeting) => void;
  onCancelMeeting: (meetingId: string) => void;
  onDeleteMeeting: (meetingId: string) => void;
  countries: Record<string, string>;
}

export default function UpcomingMeetings({
  meetings,
  onJoinMeeting,
  onCancelMeeting,
  onDeleteMeeting,
  countries
}: UpcomingMeetingsProps) {
  const isScheduledTime = (date: string, time: string) => {
    const scheduledDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const timeDiff = scheduledDateTime.getTime() - now.getTime();
    return timeDiff >= -300000 && timeDiff <= 300000;
  };

  return (
    <Card className="mt-6 dark:bg-gray-900 border dark:border-gray-800">
      <CardHeader className="py-3 bg-[#F8F8F8] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center gap-2 text-[#232333] dark:text-gray-100 text-lg font-medium">
          <Calendar className="h-5 w-5" />
          Upcoming Meetings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {meetings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No upcoming meetings</p>
            <p className="text-sm mt-1">Schedule a meeting to see it here</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-700">
                <TableHead className="text-gray-600 dark:text-gray-300 font-medium py-3">Meeting ID</TableHead>
                <TableHead className="text-gray-600 dark:text-gray-300 font-medium py-3">Schedule</TableHead>
                <TableHead className="text-gray-600 dark:text-gray-300 font-medium py-3">Bots</TableHead>
                <TableHead className="text-gray-600 dark:text-gray-300 font-medium py-3">Duration</TableHead>
                <TableHead className="text-gray-600 dark:text-gray-300 font-medium py-3">Country</TableHead>
                <TableHead className="text-gray-600 dark:text-gray-300 font-medium py-3">Status</TableHead>
                <TableHead className="text-gray-600 dark:text-gray-300 font-medium py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id} className="border-b border-gray-100 dark:border-gray-800">
                  <TableCell className="text-gray-800 dark:text-gray-200">{meeting.meetingId}</TableCell>
                  <TableCell className="text-gray-800 dark:text-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      {format(new Date(`${meeting.scheduledDate}T${meeting.scheduledTime}`), 'MMM d, yyyy HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-800 dark:text-gray-200">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                        >
                          <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                          {meeting.bots.length}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Bot List</DialogTitle>
                          <DialogDescription>
                            Scheduled bots for meeting {meeting.meetingId}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[300px] mt-4">
                          <div className="space-y-2">
                            {meeting.bots.map((bot) => (
                              <div
                                key={bot.id}
                                className="flex items-center gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800"
                              >
                                <UserCircle2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {bot.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className="text-gray-800 dark:text-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      {meeting.duration} mins
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-800 dark:text-gray-200">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      {countries[meeting.countryCode] || meeting.countryCode}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        meeting.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      }`}
                    >
                      {meeting.status === 'cancelled' ? 'Cancelled' : 'Scheduled'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs"
                        onClick={() => onJoinMeeting(meeting)}
                        disabled={
                          meeting.status === 'cancelled' ||
                          !isScheduledTime(meeting.scheduledDate, meeting.scheduledTime)
                        }
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Join
                      </Button>
                      {meeting.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          onClick={() => onCancelMeeting(meeting.id)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        onClick={() => onDeleteMeeting(meeting.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}