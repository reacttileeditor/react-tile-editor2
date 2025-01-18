import { Creature_Delegate, Creature_Delegate_Base_ƒ } from "../../../objects_core/Creature/Creature_Delegate";

export const CT_Hermit_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () =>  5,
	yield_creature_image: () => 'hermit',
	yield_prettyprint_name: () => 'Hermit',
	yield_weapon_range: () => 3,
}
