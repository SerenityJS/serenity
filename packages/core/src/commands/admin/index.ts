import Gamemode from "./gamemode";
import Ability from "./ability";
import Clear from "./clear";
import Fill from "./fill";
import Give from "./give";
import Kick from "./kick";
import Setblock from "./setblock";
import Tag from "./tag";
import Tp from "./tp";
import Transfer from "./transfer";
import Summon from "./summon";
import Kill from "./kill";
import STOP from "./stop";
import WORLD from "./world";
import OP from "./op";
import DEOP from "./deop";
import SAVE from "./save";
import TIME from "./time";

// Define all the admin commands
const AdminCommands = [
  Gamemode,
  Ability,
  Clear,
  Fill,
  Give,
  Kick,
  Setblock,
  Tag,
  Tp,
  Transfer,
  Summon,
  Kill,
  STOP,
  WORLD,
  OP,
  DEOP,
  SAVE,
  TIME
];

export { AdminCommands };
