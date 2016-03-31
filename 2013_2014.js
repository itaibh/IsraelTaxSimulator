var tax_details = tax_details || {};

tax_details[2013] = {
    tax_levels: [
        {min: 0, tax: 0.10, additive: 0},
        {min: 63361, tax: 0.14, additive: 6336},
        {min: 108121, tax: 0.21, additive: 12602},
        {min: 168001, tax: 0.31, additive: 25177},
        {min: 240001, tax: 0.34, additive: 47497},
        {min: 501961, tax: 0.48, additive: 136564},
        {min: 811561, tax: 0.50, additive: 285172},
    ],
    bonus_point_value:2616,
    max_pension:7308,
    pension_discount: 0.35,
    donation_discout: 0.35,
}
tax_details[2014] = tax_details[2013];
