CREATE TABLE `kit_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kitId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','collaborator','viewer') NOT NULL DEFAULT 'collaborator',
	`invitedBy` int,
	`invitedAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kit_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ownerUserId` int NOT NULL,
	`activatedAt` timestamp,
	`memoryPeriodEndDate` timestamp,
	`bookFinalizationEndDate` timestamp,
	`bookProcessingStarted` boolean NOT NULL DEFAULT false,
	`bookReadyForReview` boolean NOT NULL DEFAULT false,
	`bookApproved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kits_id` PRIMARY KEY(`id`)
);
