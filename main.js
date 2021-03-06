this.commonFields = ["income", "tax", "pension", "points", "extraPoints", "donations"];

function ViewModel() {

    var self = this;

    this.markerPositions = {
        type1: {
            income: { x: 86, y: 72, w: 25, h: 12 },
            points: { x: 104, y: 158, w: 25, h: 12 },
            extraPoints: { x: 89, y: 161, w: 25, h: 12 },
            tax: { x: 108, y: 133, w: 25, h: 12 },
            pension: { x: 108, y: 144, w: 25, h: 12 }
        }
    }

    this.createObservableReport = function (report) {
        var observableReport = {
            income: ko.observable(report ? report.income : 0),
            extraPoints: ko.observable(report ? report.extraPoints : 0),
            pension: ko.observable(report ? report.pension : 0),
            donations: ko.observable(report ? report.donations : 0),
            points: ko.observable(report ? report.points : 0),
            tax: ko.observable(report ? report.tax : 0)
        };
        return observableReport;
    };

    this.year = ko.observable(2018);
    this.paidTax = ko.observable(0);

    this.reports = ko.observableArray([
        self.createObservableReport()
    ]);

    this.calculatedTax = ko.observable(0);

    this.addReport = function () {
        yearlyReportsStr = localStorage.getItem(self.year());
        if (yearlyReportsStr != null) {
            var yearlyReports = JSON.parse(yearlyReportsStr);
            if (yearlyReports.length > self.reports().length) {
                var lastReport = yearlyReports[self.reports().length];
                self.reports.push(self.createObservableReport(lastReport));
                return;
            }
        }
        self.reports.push(self.createObservableReport());
    };

    this.removeReport = function () {
        self.reports.remove(this);
    };

    this.coerceReports = function () {
        for (var i = 0; i < self.reports().length; ++i) {
            var r = self.reports()[i];
            r.income(parseFloat(r.income()));
            r.extraPoints(parseFloat(r.extraPoints()));
            r.pension(parseFloat(r.pension()));
            r.donations(parseFloat(r.donations()));
            r.points(parseFloat(r.points()));
            r.tax(parseFloat(r.tax()));
        }
    }

    this.computeTax = function(report){
        var taxData = tax_details[self.year()];
        var levels = taxData.tax_levels;
        var calculatedTax = 0;
        var taxLevel = 0;
        for (var i = 0; i < levels.length; ++i) {
            if (report.income() < levels[i].min) break;
            taxLevel = i;
        }
        var level = levels[taxLevel];
        calculatedTax = level.additive + (report.income() - level.min) * level.tax;
        calculatedTax -= taxData.bonus_point_value * report.points();
        calculatedTax -= report.extraPoints();
        calculatedTax -= report.pension() * taxData.pension_discount;
        return calculatedTax;
    }

    this.calcTax = function () {
        var taxData = tax_details[self.year()];

        self.coerceReports();
        localStorage[self.year()] = ko.toJSON(self.reports());

        var calculatedTax = 0;
        var paidTax = 0;
        for (var i = 0; i < self.reports().length; ++i) {
            var r = self.reports()[i];
            paidTax += r.tax();
            calculatedTax += this.computeTax(r);
        }
        
        self.paidTax(paidTax);
        
        var donations = 0;
        if (!isNaN(donations)) {
            calculatedTax -= donations * taxData.donation_discout;
        }

        self.calculatedTax(Math.round(calculatedTax) | 0);
    };

    this.year.subscribe(function (year) {
        self.reports.removeAll();
        yearlyReportsStr = localStorage.getItem(year);
        if (yearlyReportsStr != null) {
            var yearlyReports = JSON.parse(yearlyReportsStr);
            yearlyReports.forEach(report => {
                self.reports.push(self.createObservableReport(report))
            });
        } else {
            self.reports.push(self.createObservableReport());
        }
    });

    this.moveMarker = function (fieldName) {
        var marker = document.getElementById("marker");
        var coords = self.markerPositions["type1"][fieldName];
        if (coords) {
            marker.style.visibility = "visible";
            marker.style.left = coords.x + "px";
            marker.style.top = coords.y + "px";
            marker.style.width = coords.w + "px";
            marker.style.height = coords.h + "px";
        } else {
            marker.style.visibility = "hidden";
        }
    }
};

ko.applyBindings(new ViewModel());
