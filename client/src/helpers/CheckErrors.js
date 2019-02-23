import SubmitReques from './SubmitRequest'

export default class CheckErrors{
    static async updateActivityErrors(activity){
        var { data } = await SubmitRequest.submitQueryString(`/api/manugoals_activities/${activity._id}`);
        var orphaned = checkOrphaned(data, activity)
        var unscheduled_enabled = checkUnscheduledEnabled(goal,activity);
        var over_deadline = checkOverDeadline(goal, activity);
        var new_activity = {
            ...activity, 
            orphaned, 
            unscheduled_enabled, 
            over_deadline
        }
        console.log(new_activity);
        await SubmitRequest.submitUpdateItem('manuactivities', new_activity);
        return []
    }

    static checkOrphaned(goal, activity){
        return activity.scheduled && !goal.enabled
    }

    static checkUnscheduledEnabled(goal,activity){
        return goal.enabled && !activity.scheduled
    }

    static checkOverDeadline(goal, activity){
        var {start, duration} = activity;
        var end = start.setHours(start.getHours() + duration);
        return (end > goal.deadline);
    }
}
