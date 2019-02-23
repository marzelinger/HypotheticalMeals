import SubmitRequest from './SubmitRequest'

export default class CheckErrors{
    static async updateActivityErrors(activity){
        console.log("checking activity errors")
        console.log(activity);
        var { data } = await SubmitRequest.submitQueryString(`/api/manugoals_activity/${activity._id}`);
        console.log(data);
        var orphaned = CheckErrors.checkOrphaned(data, activity)
        var unscheduled_enabled = CheckErrors.checkUnscheduledEnabled(data,activity);
        var over_deadline = CheckErrors.checkOverDeadline(data, activity);
        var new_activity = {
            ...activity, 
            orphaned, 
            unscheduled_enabled, 
            over_deadline
        }
        console.log(new_activity);
        await SubmitRequest.submitUpdateItem('manuactivities', new_activity);
    }

    static checkOrphaned(goal, activity){
        return activity.scheduled && !goal.enabled
    }

    static checkUnscheduledEnabled(goal,activity){
        return goal.enabled && !activity.scheduled
    }

    static checkOverDeadline(goal, activity){
        var {start, duration} = activity;
        var start_date = new Date(start);
        var end = start_date.setHours(start_date.getHours() + duration);
        return (end > goal.deadline);
    }

    static getErrorMessages(activity){

    }
}
