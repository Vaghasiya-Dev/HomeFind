
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, User as UserIcon, Star, Phone } from 'lucide-react';
import { StudentDetail, isRelationError } from '@/types/property';

interface RoommateCardProps {
  student: StudentDetail;
  compatibilityScore: number;
}

export default function RoommateCard({ student, compatibilityScore }: RoommateCardProps) {
  const userName = student.user && !isRelationError(student.user) && student.user.full_name
    ? student.user.full_name
    : 'Not provided';

  const userEmail = student.user && !isRelationError(student.user) && student.user.email
    ? student.user.email
    : '';

  const userPhone = student.user && !isRelationError(student.user) && student.user.phone
    ? student.user.phone
    : 'Not provided';

  const formatDailyRoutine = () => {
    if (!student.daily_routine || typeof student.daily_routine !== 'object') {
      return 'No routine information available';
    }

    const routine = student.daily_routine;
    const parts = [];

    if (routine.wake_up_time) parts.push(`Wakes up: ${routine.wake_up_time}`);
    if (routine.sleep_time) parts.push(`Sleeps: ${routine.sleep_time}`);
    if (routine.study_hours) parts.push(`Studies: ${routine.study_hours}`);
    if (routine.extracurricular) parts.push(`Activities: ${routine.extracurricular}`);

    return parts.length > 0 ? parts.join(' • ') : 'No routine details';
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {userName !== 'Not provided' ? userName.charAt(0) : 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg truncate">{userName}</h3>
                {userEmail && (
                  <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
                )}
              </div>
              <Badge className={`${getCompatibilityColor(compatibilityScore)} border-0`}>
                <Star className="h-3 w-3 mr-1" />
                {compatibilityScore}%
              </Badge>
            </div>

            <div className="space-y-2">
              {/* Contact Information */}
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{userPhone}</p>
                </div>
              </div>

              {student.college_name && (
                <p className="text-sm"><span className="font-medium">College:</span> {student.college_name}</p>
              )}
              
              {student.course && (
                <p className="text-sm"><span className="font-medium">Course:</span> {student.course}</p>
              )}

              <div className="flex items-start gap-1 mt-3">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{formatDailyRoutine()}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}