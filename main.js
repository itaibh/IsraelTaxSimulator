function ViewModel(){

    var self = this;

    this.createObservableReport = function(report){
        var observableReport = {
            income:ko.observable(report.income),
            extraPoints:ko.observable(report.extraPoints),
            pension:ko.observable(report.pension),
            donations:ko.observable(report.donations),
            points:ko.observable(report.points),
            tax:ko.observable(report.tax)
        };
        return observableReport;
    };

    this.year = ko.observable(2018);
    this.paidTax = ko.observable(0);

    this.reports = ko.observableArray([
        self.createObservableReport({
            income:389192,
            extraPoints:0,
            pension:22320,
            donations:0,
            points:4.75,
            tax:83372
        })
    ]);

    this.calculatedTax = ko.observable(0);

    this.addReport = function()
    {
        yearlyReportsStr = localStorage.getItem(self.year());
        if (yearlyReportsStr != null) {
            var yearlyReports = JSON.parse(yearlyReportsStr);
            if (yearlyReports.length > self.reports().length) {
                var lastReport = yearlyReports[self.reports().length];
                self.reports.push(self.createObservableReport(lastReport));
                return;
            }
        }
        self.reports.push(
            self.createObservableReport({
                income:164130,
                extraPoints:0,
                pension:8100,
                donations:0,
                points:5.25,
                tax:7221
            }
        ));
    };

    this.removeReport = function()
    {
        self.reports.remove(this);
    };

    this.coerceReports = function(){
        for (var i=0;i<self.reports().length;++i)
        {
            var r = self.reports()[i];
            r.income(parseInt(r.income()));
            r.extraPoints(parseInt(r.extraPoints()));
            r.pension(parseInt(r.pension()));
            r.donations(parseInt(r.donations()));
            r.points(parseInt(r.points()));
            r.tax(parseInt(r.tax()));
        }
    }

    this.calcTax = function()
    {
        var taxData = tax_details[self.year()];

        self.coerceReports();
        localStorage[self.year()] = ko.toJSON(self.reports());

        var income = 0;
        var tax = 0;
        var extraPoints = 0;
        var pension = 0;
        var donations = 0;
        var points = 0;
        for (var i=0;i<self.reports().length;++i)
        {
            var r = self.reports()[i];
            income += r.income();
            extraPoints += r.extraPoints();
            pension += Math.min(r.pension(), taxData.max_pension);
            donations += r.donations();
            points += r.points();
            tax += r.tax();
        }

        self.paidTax(tax);

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
        calculatedTax -= taxData.bonus_point_value * points;
        calculatedTax -= extraPoints;
        calculatedTax -= pension * taxData.pension_discount;

        if (!isNaN(donations)){
            calculatedTax -= donations * taxData.donation_discout;
        }

        self.calculatedTax(Math.round(calculatedTax) | 0);
    };

    this.year.subscribe(function(year){
        self.reports.removeAll();
        yearlyReportsStr = localStorage.getItem(year);
        if (yearlyReportsStr != null) {
            var yearlyReports = JSON.parse(yearlyReportsStr);
            yearlyReports.forEach(report => {
                self.reports.push(self.createObservableReport(report))
            });
        }
    });
    
};

ko.applyBindings(new ViewModel());
