/**
 * Event priority determines the order of event signals.
 * @Before The event signal will be executed before the server handles the event.
 * @After The event signal will be executed after the server handles the event.
 * @During The event signal will be executed while the server handles the event.
 */
enum EventPriority {
	Before,
	After,
	During
}

export { EventPriority };
