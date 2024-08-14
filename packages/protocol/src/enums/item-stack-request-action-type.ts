enum ItemStackRequestActionType {
	Take = 0,
	Place = 1,
	Swap = 2,
	Drop = 3,
	Destroy = 4,
	Consume = 5,
	Create = 6,
	PlaceInItemContainer_DEPRECATED = 7,
	TakeFromItemContainer_DEPRECATED = 8,
	ScreenLabTableCombine = 9,
	ScreenBeaconPayment = 10,
	ScreenHUDMineBlock = 11,
	CraftRecipe = 12,
	CraftRecipeAuto = 13,
	CraftCreative = 14,
	CraftRecipeOptional = 15,
	CraftRepairAndDisenchant = 16,
	CraftLoom = 17,
	CraftNonImplemented_DEPRECATEDASKTYLAING = 18,
	CraftResults_DEPRECATEDASKTYLAING = 19,
	ifdef = 20,
	TEST_INFRASTRUCTURE_ENABLED = 21,
	Test = 22,
	endif = 23
}

export { ItemStackRequestActionType };
