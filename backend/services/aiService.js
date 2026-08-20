const axios = require('axios');
const Category = require('../models/Category');

const localDiagnose = async (description) => {
  const text = description.toLowerCase();
  
  // Default response
  let result = {
    causes: [
      "Hardware degradation over time.",
      "Improper maintenance or electrical issue.",
      "Software configuration error or physical blockage."
    ],
    troubleshooting: [
      "Power cycle the device (turn off, wait 30 seconds, turn back on).",
      "Check all cable connections and power plugs.",
      "Consult the manufacturer's user manual."
    ],
    severity: "Medium",
    professionalHelp: true,
    categoryName: "Laptop Repair"
  };

  // 1. Laptop/Computer/Support
  if (text.includes('laptop') || text.includes('computer') || text.includes('chrome') || text.includes('boot') || text.includes('windows') || text.includes('screen black') || text.includes('keyboard') || text.includes('ram') || text.includes('pc') || text.includes('slow')) {
    result = {
      causes: [
        "Low memory (RAM) caused by heavy application usage.",
        "Overheating due to dust blockages in the ventilation shaft.",
        "Malware or background applications running on startup.",
        "Fragmented storage drive or failing SSD/HDD."
      ],
      troubleshooting: [
        "Close unused browser tabs and background applications.",
        "Restart your computer to clear cached memory.",
        "Run an antivirus scan using Windows Defender or security software.",
        "Clean out dust from laptop side vents."
      ],
      severity: "Medium",
      professionalHelp: false,
      categoryName: "Laptop Repair"
    };
  }
  // 2. Mobile
  else if (text.includes('mobile') || text.includes('phone') || text.includes('iphone') || text.includes('android') || text.includes('screen crack') || text.includes('charge') || text.includes('battery')) {
    result = {
      causes: [
        "Rechargeable battery capacity depletion.",
        "Accumulation of lint/dust in the charging port.",
        "Physical impacts causing micro-cracks in the LCD screen.",
        "Software glitches in background sync operations."
      ],
      troubleshooting: [
        "Carefully clean the charging port with a toothpick.",
        "Try using an alternate charging block and USB cable.",
        "Perform a hard reboot/force restart of the phone.",
        "Turn down brightness and enable power saver mode."
      ],
      severity: "Medium",
      professionalHelp: true,
      categoryName: "Mobile Repair"
    };
  }
  // 3. Wi-Fi
  else if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet') || text.includes('router') || text.includes('disconnect') || text.includes('modem')) {
    result = {
      causes: [
        "Temporary local internet service provider (ISP) outage.",
        "Outdated router configuration or firmware crash.",
        "Wireless signal attenuation from concrete walls or metal obstacles."
      ],
      troubleshooting: [
        "Unplug your router and modem, wait 30 seconds, and plug them back in.",
        "Verify if other devices in the house can connect to the internet.",
        "Ensure DSL/Ethernet cable is securely clicked into the WAN port."
      ],
      severity: "Low",
      professionalHelp: false,
      categoryName: "Wi-Fi/Internet"
    };
  }
  // 4. Electrical
  else if (text.includes('wire') || text.includes('spark') || text.includes('fuse') || text.includes('light') || text.includes('socket') || text.includes('switch') || text.includes('electricity') || text.includes('power')) {
    result = {
      causes: [
        "Loose copper wiring terminals within the switchboard.",
        "Electrical overload tripping the local circuit breaker.",
        "Old insulation failing and causing a short circuit."
      ],
      troubleshooting: [
        "Turn off the main mains switch or circuit breaker immediately.",
        "Unplug all heavy heating appliances from the affected socket.",
        "Do not touch bare wires or sparking outlets under any circumstance."
      ],
      severity: "High",
      professionalHelp: true,
      categoryName: "Electrical"
    };
  }
  // 5. Plumbing
  else if (text.includes('pipe') || text.includes('leak') || text.includes('tap') || text.includes('drain') || text.includes('water') || text.includes('clog') || text.includes('plumb') || text.includes('basin') || text.includes('toilet')) {
    result = {
      causes: [
        "Deterioration of internal rubber washers or washers within the tap.",
        "Hair, soap scum, or grease blockages inside the pipe U-bend.",
        "Excessive water pressure causing joints to weaken."
      ],
      troubleshooting: [
        "Locate the local stop valve under the sink and turn it off.",
        "Use a hand plunger to try and release clogs.",
        "Wrap leak sealing tape tightly around the joint as a temporary fix."
      ],
      severity: "High",
      professionalHelp: true,
      categoryName: "Plumbing"
    };
  }
  // 6. AC
  else if (text.includes('ac') || text.includes('cooling') || text.includes('compressor') || text.includes('air conditioner') || text.includes('filter')) {
    result = {
      causes: [
        "Air filter completely clogged with dust restricting air movement.",
        "Refrigerant gas (Freon) leak in the coils.",
        "Faulty compressor starter capacitor."
      ],
      troubleshooting: [
        "Open the front panel and wash the mesh filters with water.",
        "Verify that the AC remote is in 'COOL' mode and temperature is low.",
        "Check that the outdoor compressor unit has space to breathe."
      ],
      severity: "Medium",
      professionalHelp: true,
      categoryName: "AC Repair"
    };
  }
  // 7. Fridge
  else if (text.includes('fridge') || text.includes('refrigerator') || text.includes('ice') || text.includes('cooling') || text.includes('compressor') || text.includes('spoiling')) {
    result = {
      causes: [
        "Dust buildup on condenser coils preventing heat dissipation.",
        "Worn out magnetic gasket seal on the refrigerator door.",
        "Defrost heater failure causing frost accumulation over air vents."
      ],
      troubleshooting: [
        "Ensure the door seal grabs tightly (do a paper pinch test).",
        "Pull the fridge away from the wall to clear dust from coils.",
        "Defrost manually by leaving it unplugged for 4 hours with doors open."
      ],
      severity: "Medium",
      professionalHelp: true,
      categoryName: "Refrigerator Repair"
    };
  }
  // 8. Washing Machine
  else if (text.includes('washing') || text.includes('dryer') || text.includes('machine') || text.includes('spin') || text.includes('drum')) {
    result = {
      causes: [
        "Uneven load distribution causing the safety switch to halt.",
        "Drain filter blocked by small items (coins, lint).",
        "Worn-out drum suspension rods or drive belt."
      ],
      troubleshooting: [
        "Rearrange wet clothes evenly inside the washing drum.",
        "Open the bottom filter flap and clear the debris trap.",
        "Check that the machine is level on the floor (adjust screw feet)."
      ],
      severity: "Medium",
      professionalHelp: true,
      categoryName: "Washing Machine Repair"
    };
  }
  // 9. CCTV
  else if (text.includes('cctv') || text.includes('camera') || text.includes('dvr') || text.includes('nvr') || text.includes('footage')) {
    result = {
      causes: [
        "Loose coaxial or ethernet connection behind the recorder.",
        "DC power adapter adapter supply failure.",
        "Hard disk formatting errors leading to recording failures."
      ],
      troubleshooting: [
        "Unplug the power source for the camera adapter and plug back in.",
        "Check connection on the back of DVR/NVR.",
        "Run local disk self-check in settings."
      ],
      severity: "Low",
      professionalHelp: true,
      categoryName: "CCTV Installation"
    };
  }

  // Find category in DB dynamically
  const category = await Category.findOne({ name: result.categoryName });
  result.recommendedCategory = category ? category._id : null;
  result.categoryObj = category;
  
  return result;
};

const diagnoseIssue = async (description) => {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const prompt = `You are FixAI, an intelligent home-service diagnosis system.
Analyze this user problem: "${description}"
You must return a raw JSON object containing:
1. "causes": array of strings (possible causes)
2. "troubleshooting": array of strings (troubleshooting steps)
3. "severity": "Low", "Medium", or "High"
4. "professionalHelp": true or false
5. "categoryName": string matching exactly one of these: ["Laptop Repair", "Mobile Repair", "Wi-Fi/Internet", "Electrical", "Plumbing", "AC Repair", "Refrigerator Repair", "Washing Machine Repair", "Computer Support", "CCTV Installation"]

Return ONLY raw JSON. No markdown blocks, no other text.`;

      const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }]
      }, { timeout: 8000 });

      let text = response.data.candidates[0].content.parts[0].text;
      // Clean potential JSON markdown fence
      text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const aiResponse = JSON.parse(text);

      const category = await Category.findOne({ name: aiResponse.categoryName });
      
      return {
        causes: aiResponse.causes,
        troubleshooting: aiResponse.troubleshooting,
        severity: aiResponse.severity,
        professionalHelp: aiResponse.professionalHelp,
        recommendedCategory: category ? category._id : null,
        categoryObj: category
      };
    } catch (error) {
      console.warn("Gemini AI API Call failed, falling back to local analysis", error.message);
      return await localDiagnose(description);
    }
  }

  // Fallback to offline rule-based diagnosis
  return await localDiagnose(description);
};

module.exports = { diagnoseIssue };
