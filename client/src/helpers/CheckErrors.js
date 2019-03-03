import SubmitRequest from './SubmitRequest'

export default class CheckErrors{
    static async updateActivityErrors(activity){
        console.log("this is the activity: "+JSON.stringify(activity));
        var { data } = await SubmitRequest.submitQueryString(`/api/manugoals_activity/${activity._id}`);
<<<<<<< HEAD
        console.log("this is the checkerrors stuff: "+JSON.stringify(data));
=======
        console.log("this is the data:"+ JSON.stringify(data));
>>>>>>> 9c3a3e8233e1cc34476855fe60aaa7e4bd4e5fab
        var goal = data[0];
        var orphaned = CheckErrors.checkOrphaned(goal, activity)
        var unscheduled_enabled = CheckErrors.checkUnscheduledEnabled(goal,activity);
        var over_deadline = CheckErrors.checkOverDeadline(goal, activity);
        console.log(over_deadline)
        var new_activity = {
            ...activity, 
            orphaned, 
            unscheduled_enabled, 
            over_deadline
        }
        console.log(new_activity)
        let response =  await SubmitRequest.submitUpdateItem('manuactivities', new_activity);
        console.log(response);
        return response.data;
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
        var deadline = new Date(goal.deadline);
        console.log('end: ' + end)
        console.log('deadline: ' + deadline)
        return (end.getTime() > deadline.getTime());
    }

    static getEndTime(activity){
        var {start, duration} = activity;
        var start_date = new Date(start);
        start_date.setHours(start_date.getHours() + Math.floor(duration/10)*24 + (duration%10));
        return start_date;
    }

    static async getErrorMessages(activity){
        var error_messages = [];
        console.log(activity);
        var { data } = await SubmitRequest.submitQueryString(`/api/manugoals_activity/${activity._id}`);
        var name = `Activity [Manufacturing Goal:${data[0].name}, SKU: ${activity.sku.name}:${activity.sku.unit_size}*${activity.sku.cpc}]`
        if(activity.overwritten){
            var message = 'Activity duration has been overridden by an admin.'
            error_messages.push({key:'over_ridden', message});
        }
        if(activity.orphaned){
            var message = 'Activity goal has been disabled, activity is orphaned.'
            error_messages.push({key: 'orphaned', message});
            return {
                name, error_messages
            }
        }
        if(activity.over_deadline){
            var message = `Activity is currently scheduled to finish after goal deadline at ${new Date(data[0].deadline)}.`
            error_messages.push({key: 'over_deadline',message});
        }
        if(activity.unschedled_enabled){
            var message = `Activity still needs to be scheduled and is associated with an enabled goal.`
            error_messages.push({key: 'unscheduled_enabled', message});
        }
        if(error_messages.length > 0){
            return {name, error_messages}
        }
        return null;
    }
}
