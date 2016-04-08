function ExpandToggle(topicID) {
	var expand = document.getElementById(topicID);
	if (!expand) return true;
	if (expand.style.display == "none") {
		expand.style.display = "block"
	} else {
		expand.style.display = "none"
	}
	return true;
}

function RpiDef(rpiId) {
	var mapping = {
		"rpi1": {
			"gpioControllerAddr": "0x20200000",
			"gpioControllerAddrSub": "20200000",
			"gpioControllerAddrSubDec": "538968064",
			"gpioControllerCpuDoc": "0x7E200000",
			"actLedPin": 16,
			"actLedTurnOnAddr": 40,
			"actLedSetOrd": "second",
			"actLedTurnPinOnParagraph": "This means \
sending a message to the GPIO controller to turn pin 16 off. Yes, <em>turn it off</em>. \
The chip manufacturers decided it made more sense<a class=\"noteLink\" name=\"note5a\" \
href=\"#note5\" title=\"Note 5\"><sup>[5]</sup></a> to have the LED turn on when \
the GPIO pin is off. Hardware engineers often seem to take these sorts of decisions, \
seemingly just to keep OS Developers on their toes. Consider yourself warned.",
			"actLedOk01OnExplanation": "The second \
shifts the binary representation of this 1 left by 16 places. Since we want to turn \
pin 16 off, we need to have a 1 in the 16th bit of this next message (other values \
would work for other pins). Finally we write it out to the address which is 40<sub>10</sub> \
added to the GPIO controller address, which happens to be the address to write to \
turn a pin off (28 would turn the pin on)."
		},
		"rpib+": {
			"gpioControllerAddr": "0x20200000",
			"gpioControllerAddrSub": "20200000",
			"gpioControllerAddrSubDec": "538968064",
			"gpioControllerCpuDoc": "0x7E200000",
			"actLedPin": 47,
			"actLedTurnOnAddr": 32,
			"actLedSetOrd": "fifth",
			"actLedTurnPinOnParagraph": "This means \
sending a message to the GPIO controller to turn pin 47 on.  In the previous Raspberry \
Pi versions we actually send the message to turn this pin off, but the hardware has \
changed. For a better explanation of pull-high and pull-low see the comments below. \
<sup>[5]<a class=\"noteBackLink\" href=\"#note5a\">^</a></sup>",
			"actLedOk01OnExplanation": "The second \
shifts the binary representation of this 1 left by 15 places. You may be wondering, why 15? \
Why don't we use 47 here.  The answer to that involves some background in addressing which \
we'll cover briefly here, we write to memory by writing to 4 byte registers.  \
As we know 4 bytes is equivalent to 32 bits which is substantially less than 47.  \
A 47 position left logical shift would overrun the size of the register.  \
There are actually two SET and two CLR registers, the first for pins 0-31 and the second \
for pins 32-63.  We are using the second register so we truncate the first 32 bits making \
the shift 47-32, or 15 bits.  We want to turn pin 47 on, which requires that we have a 1 \
in the 15th bit of this next message (other values would work for other pins). Finally we write \
it out to the GPSET1 address which is 32<sub>10</sub> added to the GPIO controller address, \
which happens to be the address to write to turn a pin on.  Likewise, the pin could be \
turned off with a similar set of instructions, but writing to the GPCLR1 register at offset 44<sub>10</sub>"
		},
		"rpi2": {
			"gpioControllerAddr": "0x3f200000",
			"gpioControllerAddrSub": "3f200000",
			"gpioControllerAddrSubDec": "1059061760",
			"gpioControllerCpuDoc": "0x7E200000",
			"actLedPin": 47,
			"actLedTurnOnAddr": 32,
			"actLedSetOrd": "fifth"
		}
	};
	mapping["rpi2"]["actLedTurnPinOnParagraph"] = mapping["rpib+"]["actLedTurnPinOnParagraph"];
	mapping["rpi2"]["actLedOk01OnExplanation"] = mapping["rpib+"]["actLedOk01OnExplanation"];
	var definition = mapping[rpiId];
	definition["actLedPin32bitOffset"] = definition["actLedPin"] % 32;
	definition["actLedPin32bitOffsetOrd"] = definition["actLedPin32bitOffset"] + Ord(definition["actLedPin32bitOffset"]);
	definition["actLedPinOrd"] = definition["actLedPin"] + Ord(definition["actLedPin"]);
	definition["actLedGpfselAddr"] = 4 * Math.floor(definition["actLedPin"] / 10);
	definition["actLedGpfselBit"] = 3 * (definition["actLedPin"] % 10);
	definition["actLedGpfselBitSet"] = definition["actLedPin"] % 10;
	definition["actLedGpfselBitSetOrd"] = definition["actLedGpfselBitSet"] + Ord(definition["actLedGpfselBitSet"]);
	definition["actLedGpfselBitShiftBin"] = (1 << definition["actLedGpfselBit"]).toString(2);
	definition["actLedGpfselBitShiftDec"] = 1 << definition["actLedGpfselBit"];
	definition["actLedPinRange"] = (10 * Math.floor(definition["actLedPin"] / 10)) +
		"-" + ((10 * (Math.floor(definition["actLedPin"] / 10) + 1)) - 1);
	return definition;
}

function LoadRpi() {
	var definition = RpiDef($(this).val());
	for (key in definition) {
		$("span." + key).html(definition[key]);
	}
}

function Ord(n) {
	var s=["th","st","nd","rd"],
		v=n%100;
	return n+(s[(v-20)%10]||s[v]||s[0]);
}

function BuildSite() {
	var optTemplate = '<input type="radio" name="rpiType" value="%rpiId">%rpiName</input>';
	var mapping = {
		"rpi1": "Raspberry Pi 1",
		"rpib+": "Raspberry Pi B+",
		"rpi2": "Raspberry Pi 2",
	};
	var opts = "";
	for (key in mapping) {
		opts += optTemplate.replace("%rpiId", key).replace("%rpiName", mapping[key]);
	}
	$("#rpiSelectForm").html("<form>" + opts + "</form>");
	for (key in mapping) {
		$("#rpiSelectForm input:radio").click(LoadRpi);
	}
	$("#rpiSelectForm input:radio[value='rpi1']").click();
}

$(document).ready(BuildSite)
