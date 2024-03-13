enum Reliability {
	Unreliable,
	UnreliableSequenced,
	Reliable,
	ReliableOrdered,
	ReliableSequenced,
	UnreliableWithAckReceipt,
	ReliableWithAckReceipt,
	ReliableOrderedWithAckReceipt
}

export { Reliability };
