export function formatMinecraftColorCode(text: string): string {
	const ansiColors: { [key: string]: string } = {
		"0": "\u001B[30m", // Black
		"1": "\u001B[34m", // Dark Blue
		"2": "\u001B[32m", // Dark Green
		"3": "\u001B[36m", // Dark Aqua
		"4": "\u001B[31m", // Dark Red
		"5": "\u001B[35m", // Dark Purple
		"6": "\u001B[33m", // Gold
		"7": "\u001B[37m", // Gray
		"8": "\u001B[90m", // Dark Gray
		"9": "\u001B[94m", // Blue
		a: "\u001B[92m", // Green
		b: "\u001B[96m", // Aqua
		c: "\u001B[91m", // Red
		d: "\u001B[95m", // Light Purple
		e: "\u001B[93m", // Yellow
		f: "\u001B[97m", // White
		r: "\u001B[0m" // Reset
	};

	// Regular expression to find Minecraft color codes
	const regex = /§[\da-fk-or]/g;

	// Replace the Minecraft color codes with ANSI codes
	return (
		text.replaceAll(regex, (match) => {
			const code = match.charAt(1);
			return ansiColors[code] || "";
		}) + "\u001B[0m"
	); // Reset color at the end
}
