
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';

export interface FilterOptions {
  sleepSchedule: string;
  studyHabits: string;
}

interface RoommateFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

export default function RoommateFilters({ filters, onFilterChange, onReset }: RoommateFiltersProps) {
  const handleSleepScheduleChange = (value: string) => {
    onFilterChange({ ...filters, sleepSchedule: value });
  };

  const handleStudyHabitsChange = (value: string) => {
    onFilterChange({ ...filters, studyHabits: value });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sleep Schedule</label>
            <Select value={filters.sleepSchedule} onValueChange={handleSleepScheduleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Any schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any schedule</SelectItem>
                <SelectItem value="early">Early Bird (Sleep by 10 PM)</SelectItem>
                <SelectItem value="normal">Normal (Sleep by 12 AM)</SelectItem>
                <SelectItem value="late">Night Owl (Sleep after 12 AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Study Habits</label>
            <Select value={filters.studyHabits} onValueChange={handleStudyHabitsChange}>
              <SelectTrigger>
                <SelectValue placeholder="Any habits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any habits</SelectItem>
                <SelectItem value="morning">Morning Studier</SelectItem>
                <SelectItem value="evening">Evening Studier</SelectItem>
                <SelectItem value="flexible">Flexible Schedule</SelectItem>
                <SelectItem value="intense">Intensive Study (8+ hours)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onReset}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}
