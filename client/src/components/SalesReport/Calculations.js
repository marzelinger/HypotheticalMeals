// Calculations.js


export default class Calculations{


    //need to calculate total revenue, average revenue per case
    //add up all the sales*price for each record to get the total rev
    //avg revenue per case
    //total revenue/num cases
    //sales = #cases sold
    //price = price per case
    static getSalesTotalPerYear(records) {
        var total_rev = 0;
        var total_cases = 0;
        var avg_rev_per_case = 0;
        for (let rec = 0; rec<records.length; rec++){
            total_cases +=records[rec].sales;
            total_rev += (records[rec].sales * records[rec].ppc);
        }
        if(total_cases!=0){
            avg_rev_per_case = total_rev/total_cases;
        }

        return { yr_revenue: total_rev, yr_avg_rev_per_case: avg_rev_per_case};
    }


  }
