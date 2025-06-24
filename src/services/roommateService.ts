
import { supabase } from '@/integrations/supabase/client';
import { StudentDetail } from '@/types/property';
import { FilterOptions } from '@/components/student/RoommateFilters';

export const getBookedStudents = async () => {
  const { data, error } = await supabase
    .from('student_details')
    .select('*')
    .eq('has_booked_pg', true);
  
  if (error) throw error;
  
  console.log('Raw student data:', data);
  
  // Fetch user profiles separately for each student
  const studentsWithUsers = await Promise.all(
    data.map(async (student) => {
      console.log('Fetching profile for user_id:', student.user_id);
      
      // Use .maybeSingle() instead of .single() to handle missing profiles gracefully
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', student.user_id)
        .maybeSingle(); 
      
      if (profileError) {
        console.error('Error fetching profile for user_id:', student.user_id, profileError);
        return {
          ...student,
          user: { full_name: null, phone: null, email: null }
        } as StudentDetail;
      }
      
      console.log('Profile data for user_id:', student.user_id, userProfile);
      
      return {
        ...student,
        user: userProfile || { full_name: null, phone: null, email: null }
      } as StudentDetail;
    })
  );
  
  console.log('Students with user profiles:', studentsWithUsers);
  return studentsWithUsers;
};

export const calculateCompatibilityScore = (
  currentUser: StudentDetail, 
  otherUser: StudentDetail
): number => {
  let score = 50; // Base score

  // Check if both users have daily routine data
  if (!currentUser.daily_routine || !otherUser.daily_routine) {
    return score;
  }

  const currentRoutine = currentUser.daily_routine;
  const otherRoutine = otherUser.daily_routine;

  // Sleep schedule compatibility (30 points max)
  if (currentRoutine.sleep_time && otherRoutine.sleep_time) {
    const currentSleep = parseInt(currentRoutine.sleep_time.split(':')[0]);
    const otherSleep = parseInt(otherRoutine.sleep_time.split(':')[0]);
    const sleepDiff = Math.abs(currentSleep - otherSleep);
    
    if (sleepDiff <= 1) score += 30;
    else if (sleepDiff <= 2) score += 20;
    else if (sleepDiff <= 3) score += 10;
  }

  // Wake up time compatibility (20 points max)
  if (currentRoutine.wake_up_time && otherRoutine.wake_up_time) {
    const currentWake = parseInt(currentRoutine.wake_up_time.split(':')[0]);
    const otherWake = parseInt(otherRoutine.wake_up_time.split(':')[0]);
    const wakeDiff = Math.abs(currentWake - otherWake);
    
    if (wakeDiff <= 1) score += 20;
    else if (wakeDiff <= 2) score += 15;
    else if (wakeDiff <= 3) score += 10;
  }

  // Study habits compatibility (additional points)
  if (currentRoutine.study_hours && otherRoutine.study_hours) {
    if (currentRoutine.study_hours === otherRoutine.study_hours) {
      score += 10;
    }
  }

  return Math.min(100, Math.max(0, score));
};

export const filterStudents = (students: StudentDetail[], filters: FilterOptions): StudentDetail[] => {
  return students.filter(student => {
    if (!student.daily_routine || typeof student.daily_routine !== 'object') {
      return true; // Include students without routine data
    }

    const routine = student.daily_routine;

    // Sleep schedule filter
    if (filters.sleepSchedule && filters.sleepSchedule !== 'any') {
      if (routine.sleep_time) {
        const sleepHour = parseInt(routine.sleep_time.split(':')[0]);
        
        switch (filters.sleepSchedule) {
          case 'early':
            if (sleepHour > 22) return false;
            break;
          case 'normal':
            if (sleepHour < 22 || sleepHour > 24) return false;
            break;
          case 'late':
            if (sleepHour <= 24) return false;
            break;
        }
      }
    }

    // Study habits filter
    if (filters.studyHabits && filters.studyHabits !== 'any') {
      if (routine.study_hours) {
        const studyHours = routine.study_hours.toLowerCase();
        
        switch (filters.studyHabits) {
          case 'morning':
            if (!studyHours.includes('morning') && !studyHours.includes('am')) return false;
            break;
          case 'evening':
            if (!studyHours.includes('evening') && !studyHours.includes('pm')) return false;
            break;
          case 'flexible':
            if (!studyHours.includes('flexible') && !studyHours.includes('any')) return false;
            break;
          case 'intense':
            if (!studyHours.includes('8') && !studyHours.includes('intensive')) return false;
            break;
        }
      }
    }

    return true;
  });
};
