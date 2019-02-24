import SubmitRequest from './SubmitRequest'

export default class CheckErrors{
    static async updateActivityErrors(activity){
        var { data } = await SubmitRequest.submitQueryString(`/api/manugoals_activity/${activity._id}`);
        var goal = data[0];
        var orphaned = CheckErrors.checkOrphaned(goal, activity)
        var unscheduled_enabled = CheckErrors.checkUnscheduledEnabled(goal,activity);
        var over_deadline = CheckErrors.checkOverDeadline(goal, activity);
        var new_activity = {
            ...activity, 
            orphaned, 
            unscheduled_enabled, 
            over_deadline
        }
        let response =  await SubmitRequest.submitUpdateItem('manuactivities', new_activity);
    }

    static checkOrphaned(goal, activity){
        return activity.scheduled && !goal.enabled
    }

    static checkUnscheduledEnabled(goal,activity){
        return goal.enabled && !activity.scheduled
    }

    static checkOverDeadline(goal, activity){
        if(!activity.scheduled){
            return false;
        }
        var end = this.getEndTime(activity);
        console.log(end);
        return (end > goal.deadline);
    }

    static getEndTime(activity){
        var {start, duration} = activity;
        var start_date = new Date(start);
        start_date.setHours(start_date.getHours() + duration);
        return start_date;
    }

    static async getErrorMessages(activity){
        var error_messages = [];
        var { data } = await SubmitRequest.submitQueryString(`/api/manugoals_activity/${activity._id}`);
        console.log(data);
        var name = `Activity [Manufacturing Goal:${data[0].name}, SKU: ${activity.sku.name}:${activity.sku.unit_size}*${activity.sku.cpc}]`
        if(activity.over_written){
            var message = 'Activity duration has been overridden by an admin.'
            error_messages.push({over_ridden: message});
        }
        if(activity.orphaned){
            var message = 'Activity goal has been disabled, activity is orphaned.'
            error_messages.push({orphaned: message});
            return {
                name, error_messages
            }
        }
        if(activity.over_deadline){
            var message = `Activity is currently scheduled to finish after goal deadline at ${data.deadline}.`
            error_messages.push({over_deadline: message});
        }
        if(activity.unschedled_enabled){
            var message = `Activity still needs to be scheduled and is associated with an enabled goal.`
            error_messages.push({unscheduled_enabled: message});
        }
        if(error_messages.length > 0){
            return {name, error_messages}
        }
        return null;
    }
}
