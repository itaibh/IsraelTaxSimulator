function ViewModel(){

    var self = this;

    this.year = ko.observable(2015);
    this.points = ko.observable(4.25),
    this.paidTax = ko.observable(0);

    this.reports = ko.observableArray([
        {
            //income:ko.observable(0),
            //extraPoints:ko.observable(0),
            //pension:ko.observable(0),
            //donations:ko.observable(0),
            //tax:ko.observable(0)
            income:ko.observable(63929),
            extraPoints:ko.observable(0),
            pension:ko.observable(2600),
            donations:ko.observable(0),
            tax:ko.observable(13778)
        }
    ]);

    this.calculatedTax = ko.observable(0);

    this.addReport = function()
    {
        self.reports.push(
            {
                //income:ko.observable(0),
                //extraPoints:ko.observable(0),
                //pension:ko.observable(0),
                //donations:ko.observable(0),
                //tax:ko.observable(0)
                income:ko.observable(227550),
                extraPoints:ko.observable(0),
                pension:ko.observable(11260),
                donations:ko.observable(0),
                tax:ko.observable(41558)
            }
        );
    };

    this.removeReport = function()
    {
        self.reports.remove(this);
    };

    this.calcTax = function()
    {
        var income = 0;
        var tax = 0;
        var extraPoints = 0;
        var pension = 0;
        var donations = 0;
        for (var i=0;i<self.reports().length;++i)
        {
            var r = self.reports()[i];
            income += r.income();
            extraPoints += r.extraPoints();
            pension += r.pension();
            donations += r.donations();
            tax += r.tax();
        }

        self.paidTax(tax);

        var taxData = tax_details[self.year()];
        var levels = taxData.tax_levels;
        var calculatedTax = 0;
        var taxLevel = 0;
        for(var i=0;i<levels.length;++i)
        {
            if (income <  levels[i].min) break;
            taxLevel = i;
        }

        var level = levels[taxLevel];
        calculatedTax = level.additive + (income - level.min) * level.tax;
        calculatedTax -= taxData.bonus_point_value * this.points();
        calculatedTax -= extraPoints;
        calculatedTax -= Math.min(pension, taxData.max_pension) * taxData.pension_discount;

        if (!isNaN(donations)){
            calculatedTax -= donations * taxData.donation_discout;
        }

        self.calculatedTax(Math.round(calculatedTax) | 0);
    };
};

ko.applyBindings(new ViewModel());
