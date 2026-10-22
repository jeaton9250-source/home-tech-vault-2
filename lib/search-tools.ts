export type ToolField = { key: string; label: string; value: string | number; min?: number; max?: number; type?: string };
export type SearchTool = { slug: string; title: string; description: string; kind: string; fields: ToolField[]; formula: string; note: string; example: string; steps: string[] };
export type SearchArticle = { slug: string; title: string; tool: string; answer: string; sections: { heading: string; body: string }[] };
export const searchContent: { brand: string; origin: string; guidePath: string; intro: string; tools: SearchTool[]; articles: SearchArticle[] } = {
  "brand": "Home Tech Vault",
  "origin": "https://www.hometechvault.com",
  "guidePath": "/answers",
  "intro": "Get practical answers about warranty dates, appliance energy use and replacement savings. Free tools, with no account required.",
  "tools": [
    {
      "slug": "warranty-expiration-calculator",
      "title": "Warranty Expiration Date Calculator",
      "description": "Calculate a planning warranty end date from the coverage start date and term in months.",
      "kind": "warranty",
      "fields": [
        {
          "key": "start",
          "label": "Coverage start date",
          "value": "",
          "type": "date"
        },
        {
          "key": "asof",
          "label": "Compare with date",
          "value": "",
          "type": "date"
        },
        {
          "key": "months",
          "label": "Warranty term (months)",
          "value": 12,
          "min": 0,
          "max": 1200
        }
      ],
      "formula": "The planning end date is the coverage start date plus the warranty term in calendar months. If that day does not exist in the target month, the last day of that month is used.",
      "note": "Check your written warranty for the actual start event, inclusive end date, registration rules and exclusions. This tool does not verify coverage or eligibility.",
      "example": "A 12-month term beginning January 15, 2026 gives a planning end date of January 15, 2027. Your warranty wording determines whether that date is included.",
      "steps": [
        "Check whether coverage starts at purchase, delivery or installation.",
        "Enter the term exactly as shown in your warranty document.",
        "Keep the original receipt and warranty terms beside the calculated date."
      ]
    },
    {
      "slug": "appliance-running-cost-calculator",
      "title": "Appliance Running Cost Calculator",
      "description": "Estimate electricity use and cost from average watts, daily use and your electricity rate.",
      "kind": "energy",
      "fields": [
        {
          "key": "watts",
          "label": "Average power while operating (watts)",
          "value": 1000,
          "min": 0,
          "max": 1000000
        },
        {
          "key": "hours",
          "label": "Equivalent operating hours per day",
          "value": 1,
          "min": 0,
          "max": 24
        },
        {
          "key": "days",
          "label": "Days per month",
          "value": 30,
          "min": 0,
          "max": 31
        },
        {
          "key": "rate",
          "label": "Electricity rate ($ per kWh)",
          "value": 0.15,
          "min": 0,
          "max": 100
        }
      ],
      "formula": "Monthly kWh = watts ÷ 1,000 × equivalent operating hours per day × days per month. Multiply kWh by your electricity rate for monthly cost. Annual cost uses 365 days.",
      "note": "Cycling appliances do not continuously draw their rated maximum power. Use measured average consumption or the EnergyGuide label when available. Fixed utility fees are excluded.",
      "example": "A 1,000-watt appliance used one hour daily at $0.15/kWh costs $4.50 over 30 days and about $54.75 over 365 days.",
      "steps": [
        "Use measured average wattage or a realistic equivalent run time.",
        "Find the per-kWh rate on your electric bill; exclude fixed charges.",
        "Change the inputs to compare different use patterns."
      ]
    },
    {
      "slug": "appliance-replacement-budget-calculator",
      "title": "Appliance Replacement Savings Calculator",
      "description": "Calculate how much to set aside each month for a planned appliance replacement.",
      "kind": "savings",
      "fields": [
        {
          "key": "cost",
          "label": "Expected all-in replacement cost ($)",
          "value": 1500,
          "min": 0,
          "max": 10000000
        },
        {
          "key": "saved",
          "label": "Already saved ($)",
          "value": 300,
          "min": 0,
          "max": 10000000
        },
        {
          "key": "months",
          "label": "Months until planned purchase",
          "value": 12,
          "min": 0,
          "max": 1200
        }
      ],
      "formula": "Savings gap = replacement cost − savings already available, with a minimum of zero. Monthly contribution = savings gap ÷ months remaining.",
      "note": "Use a current quote that includes applicable delivery, installation, disposal and tax. No interest, inflation or investment return is assumed.",
      "example": "A $1,500 replacement with $300 already saved leaves $1,200. Over 12 months, the target is $100 per month.",
      "steps": [
        "Get an all-in estimate instead of using only the advertised price.",
        "Subtract only savings actually earmarked for the appliance.",
        "Revisit the target when your quote or purchase timing changes."
      ]
    }
  ],
  "articles": [
    {
      "slug": "how-to-calculate-warranty-expiration-date",
      "title": "How do I calculate a warranty expiration date?",
      "tool": "warranty-expiration-calculator",
      "answer": "Start with the coverage start event in your written warranty, then add the stated term. Check the wording to determine the final covered day.",
      "sections": [
        {
          "heading": "Find the start event",
          "body": "Purchase, delivery, installation and registration may have different dates. Use the event named in the warranty, rather than assuming the receipt date is always the correct start."
        },
        {
          "heading": "Keep separate coverage periods",
          "body": "Parts, labor and special components may have different terms. Record each separately instead of treating the longest advertised term as coverage for every repair."
        },
        {
          "heading": "Save evidence with the date",
          "body": "Keep the receipt, model and serial number, warranty document and registration confirmation. The calculator organizes a date estimate; the issuer determines coverage."
        }
      ]
    },
    {
      "slug": "does-a-warranty-start-at-purchase-or-delivery",
      "title": "Does a warranty start at purchase or delivery?",
      "tool": "warranty-expiration-calculator",
      "answer": "It depends on the warranty terms. Purchase, delivery, installation or another stated event may start coverage, so the correct answer comes from your product’s written warranty.",
      "sections": [
        {
          "heading": "Read the coverage section",
          "body": "Look for language describing when the term begins and whether proof of installation or registration is needed. Save the version that came with your purchase."
        },
        {
          "heading": "Preserve both dates",
          "body": "Keep the order receipt and delivery or installation record even if only one starts coverage. Having both helps you answer questions if a claim is reviewed."
        },
        {
          "heading": "Ask before assuming",
          "body": "If the terms are unclear, request clarification from the warranty provider and keep the response. Enter the confirmed start date in the calculator."
        }
      ]
    },
    {
      "slug": "how-much-does-an-appliance-cost-to-run",
      "title": "How much does an appliance cost to run?",
      "tool": "appliance-running-cost-calculator",
      "answer": "Multiply the energy used in kilowatt-hours by your electricity rate. Watts and operating time can estimate energy use when measured kWh is unavailable.",
      "sections": [
        {
          "heading": "Use energy rather than maximum power",
          "body": "A refrigerator or air conditioner cycles on and off. Its rated maximum wattage multiplied by 24 hours can overstate consumption. Use measured average consumption or label information when possible."
        },
        {
          "heading": "Check the rate units",
          "body": "A rate of 15 cents per kWh is entered as $0.15, not $15. A bill can include fixed fees and other charges that this energy-only estimate does not model."
        },
        {
          "heading": "Compare equal periods",
          "body": "Compare appliances over the same daily usage and number of days. Annual estimates in this tool use 365 days, rather than twelve 30-day months."
        }
      ]
    },
    {
      "slug": "how-to-convert-watts-to-kwh",
      "title": "How do I convert watts to kWh?",
      "tool": "appliance-running-cost-calculator",
      "answer": "Divide watts by 1,000 to get kilowatts, then multiply by hours of operation. A 1,000-watt device running for one hour uses 1 kWh if its power draw stays constant.",
      "sections": [
        {
          "heading": "Keep power and energy separate",
          "body": "Watts describe a rate of energy use; kWh describes energy consumed over time. You need both power and duration to estimate consumption."
        },
        {
          "heading": "Account for cycling",
          "body": "For equipment that cycles or changes power levels, use average watts or equivalent full-power operating hours. A label’s maximum rating is not necessarily the daily average."
        },
        {
          "heading": "Add your electricity price",
          "body": "Once you have kWh, multiply by the price per kWh. Use the running-cost calculator to compare several operating-time assumptions."
        }
      ]
    },
    {
      "slug": "how-to-save-for-appliance-replacement",
      "title": "How much should I save each month for an appliance replacement?",
      "tool": "appliance-replacement-budget-calculator",
      "answer": "Subtract money already set aside from the expected all-in replacement cost, then divide the remainder by the months until your planned purchase.",
      "sections": [
        {
          "heading": "Estimate the complete purchase",
          "body": "Include any delivery, installation, removal, accessories and applicable tax. Get a current quote so the target reflects the replacement you could actually buy."
        },
        {
          "heading": "Keep the timing realistic",
          "body": "An appliance may work beyond your planning date or fail earlier. This is a savings plan, not a prediction of when a particular machine will stop working."
        },
        {
          "heading": "Revisit the balance",
          "body": "Update the plan when prices, savings or timing change. The calculator assumes no interest or investment return and does not move or store money."
        }
      ]
    },
    {
      "slug": "what-costs-to-include-when-replacing-an-appliance",
      "title": "What costs should I include when replacing an appliance?",
      "tool": "appliance-replacement-budget-calculator",
      "answer": "Start with the appliance price, then check delivery, installation, removal, required accessories and applicable tax. Which extras apply depends on the model and installation.",
      "sections": [
        {
          "heading": "Request an itemized quote",
          "body": "Ask which services are included and which are optional. Note charges for stairs, access limitations or a second visit if they apply to your purchase."
        },
        {
          "heading": "Check compatibility first",
          "body": "Measure the opening and access route, and confirm power, water and ventilation requirements with the installer. A low product price may not reflect the installed cost."
        },
        {
          "heading": "Use the all-in number",
          "body": "Enter the complete estimate in the savings calculator and keep the quote with the old appliance’s records. Update it before committing to the purchase."
        }
      ]
    },
    {
      "slug": "what-documents-to-keep-for-an-appliance-warranty",
      "title": "What documents should I keep for an appliance warranty?",
      "tool": "warranty-expiration-calculator",
      "answer": "Keep proof of purchase, the warranty terms, model and serial number, and any installation or registration records relevant to your coverage.",
      "sections": [
        {
          "heading": "Save readable originals",
          "body": "Store a readable receipt showing the item, seller and date. Keep an electronic copy where possible, since paper receipts can fade or be lost."
        },
        {
          "heading": "Record service history",
          "body": "Keep repair invoices and correspondence. They can help explain what work was completed and which component was replaced, without guaranteeing a future claim will be accepted."
        },
        {
          "heading": "Keep the records together",
          "body": "A calculated expiration date is easier to use when it links back to the warranty wording and proof. Home Tech Vault gives those home records a place alongside the device."
        }
      ]
    },
    {
      "slug": "how-to-compare-appliance-electricity-costs",
      "title": "How do I compare electricity costs between appliances?",
      "tool": "appliance-running-cost-calculator",
      "answer": "Compare energy use over the same period and apply the same electricity rate. If labels provide annual kWh, multiply each figure by your rate for a consistent estimate.",
      "sections": [
        {
          "heading": "Compare comparable use",
          "body": "Capacity, settings, load size and usage frequency matter. Two appliances doing different amounts of work are not a fair like-for-like efficiency comparison."
        },
        {
          "heading": "Distinguish operating and purchase cost",
          "body": "Lower energy use does not automatically justify replacing a working appliance. Compare the energy difference with the all-in purchase cost and your expected ownership period."
        },
        {
          "heading": "Record your assumptions",
          "body": "Keep the source of each energy figure, the rate used and the date checked. Recalculate if your usage or tariff changes instead of treating the result as permanent."
        }
      ]
    }
  ]
};
