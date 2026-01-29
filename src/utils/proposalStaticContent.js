export const staticDesignBasis = {
    intro: "The design basis is based on the paper production of 300 TPD.",
    parameters: [
        { sn: 1, param: "Flow", unit: "m3/day", raw: "6000", anaInlet: "4890" },
        { sn: 2, param: "pH", unit: "-", raw: "6.5 - 7.5", anaInlet: "6.5 - 7.5" },
        { sn: 3, param: "Temperature", unit: "°C", raw: "30 - 38", anaInlet: "30 - 38" },
        { sn: 4, param: "TSS", unit: "mg/l", raw: "4000", anaInlet: "< 300" },
        { sn: 5, param: "VFA", unit: "meq/l", raw: "30", anaInlet: "< 30" },
        { sn: 6, param: "Calcium", unit: "mg/l", raw: "< 600", anaInlet: "< 600" },
        { sn: 7, param: "Sulphate", unit: "mg/l", raw: "< 200", anaInlet: "< 200" },
        { sn: 8, param: "sCOD", unit: "mg/l", raw: "5000", anaInlet: "5000" },
        { sn: 9, param: "BOD", unit: "mg/l", raw: "2500", anaInlet: "2500" },
        { sn: 10, param: "ORP", unit: "mV", raw: "-100 to -150", anaInlet: "-100 to -150" },
        { sn: 11, param: "NH4-N", unit: "mg/l", raw: "0", anaInlet: "0" },
        { sn: 12, param: "PO4-P", unit: "mg/l", raw: "0", anaInlet: "0" },
        { sn: 13, param: "Toxic Elements", unit: "mg/l", raw: "Nil", anaInlet: "Nil" }
    ],
    notes: [
        "Client has to ensure the feed limiting parameters like pH, TSS and temperature are maintaining well within the limit.",
        "Client has to avoid using bromine based biocide in the mill as it is a strong oxidant.",
        "Client has to ensure all the mill chemicals used in the wet end get prior approval from EDI enviro."
    ]
};

export const staticGuarantees = {
    anaerobic: [
        { sn: 1, param: "sCOD Removal", unit: ">70%" },
        { sn: 2, param: "Outlet SCOD", unit: "< 1500 mg/l" },
        { sn: 3, param: "Biogas Generation", unit: "0.40 - 0.5 Nm3/kg SCOD removed" }
    ],
    aerobic: [
        { sn: 1, param: "Outlet SCOD", unit: "200 - 300 mg/l" },
        { sn: 2, param: "Outlet BOD", unit: "< 30 mg/l" },
        { sn: 3, param: "Outlet TSS", unit: "< 100 mg/l" },
        { sn: 4, param: "Outlet VFA", unit: "< 1 meq/l" }
    ],
    notes: [
        "The above guarantee shall be applicable only if the client strictly adheres to EDI’s operational guidelines.",
        "The anaerobic reactor performance may vary depending on key parameters such as pH, temperature, total suspended solids (TSS), and the presence of toxic elements.",
        "Biogas generation may decrease if the influent sulfate (SO₄) concentration increases.",
        "Acid sizing chemicals shall not be applied in the wet end of the process.",
        "The client shall restrict the use of oxidizing biocides within the paper mill."
    ]
};

export const theoryContent = {
    bromide: {
        title: "3.1 Impact of Bromide",
        text: "Bromide (Br-) is generally tolerated up to several hundred mg/L. However, Hypobromous Acid (HOBr) is highly toxic; even low levels inhibit methanogenesis. Note: Client must avoid bromine-based biocides.",
        table: [
             { compound: "Bromide (Br-)", effect: "Low toxicity", notes: "Generally tolerated up to several hundred mg/L." },
             { compound: "Hypobromous Acid (HOBr)", effect: "Highly toxic", notes: "Inhibits methanogenesis even at low levels." }
        ]
    },
    heavyMetals: {
        title: "3.2 Impact of Heavy Metals",
        table: [
            { metal: "Zinc (Zn2+)", role: "Toxic > 5-10 mg/L", range: "-", toxic: "-", comments: "-" },
            { metal: "Copper (Cu2+)", role: "Highly toxic > 1-3 mg/L", range: "-", toxic: "-", comments: "-" },
            { metal: "Iron (Fe2+/3+)", role: "Beneficial in range 1-5 mg/L", range: "-", toxic: "-", comments: "Precipitates sulfide." }
        ]
    },
    vfa: {
        title: "3.3 Impact of Higher VFA",
        text: "High VFAs in RCF mills dissociate Calcium Carbonate (CaCO3) into Calcium Acetate. Inside the reactor, this reforms as CaCO3, causing scaling. Control: Maintain Pre-acidification degree < 40% to minimize scaling risks."
    }
};
