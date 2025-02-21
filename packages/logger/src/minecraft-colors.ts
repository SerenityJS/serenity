export function formatMinecraftColorCode(text: string): string {
  const ansiColors: { [key: string]: string } = {
    "0": "\u001B[38;2;0;0;0m",
    "1": "\u001B[38;2;0;0;170m",
    "2": "\u001B[38;2;0;170;0m",
    "3": "\u001B[38;2;0;170;170m",
    "4": "\u001B[38;2;170;0;0m",
    "5": "\u001B[38;2;170;0;170m",
    "6": "\u001B[38;2;255;170;0m",
    "7": "\u001B[38;2;170;170;170m",
    "8": "\u001B[38;2;85;85;85m",
    "9": "\u001B[38;2;85;85;255m",
    a: "\u001B[38;2;85;255;85m",
    b: "\u001B[38;2;85;255;255m",
    c: "\u001B[38;2;255;85;85m",
    d: "\u001B[38;2;255;85;255m",
    e: "\u001B[38;2;255;255;85m",
    f: "\u001B[38;2;255;255;255m",
    g: "\u001B[38;2;221;214;5m",
    h: "\u001B[38;2;227;212;209m",
    i: "\u001B[38;2;206;202;202m",
    j: "\u001B[38;2;68;58;59m",
    m: "\u001B[38;2;151;22;7m",
    n: "\u001B[38;2;180;104;77m",
    p: "\u001B[38;2;222;177;45m",
    q: "\u001B[38;2;71;160;54m",
    r: "\u001B[0m",
    s: "\u001B[38;2;44;186;168m",
    t: "\u001B[38;2;33;73;123m",
    u: "\u001B[38;2;154;92;198m"
  };

  // Regular expression to find Minecraft color codes
  const regex = /§[\da-fk-or-u]/g;

  // Replace the Minecraft color codes with ANSI codes
  return (
    text.replaceAll(regex, (match) => {
      const code = match.charAt(1);
      return ansiColors[code] || "";
    }) + "\u001B[0m"
  ); // Reset color at the end
}
