CREATE TABLE `book_chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookId` int NOT NULL,
	`chapterNumber` int NOT NULL,
	`chapterTitle` text NOT NULL,
	`content` text NOT NULL,
	`memoriesIncluded` text,
	`photosIncluded` text,
	`wordCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `book_chapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `book_metadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookTitle` text,
	`totalPages` int NOT NULL DEFAULT 0,
	`totalWords` int NOT NULL DEFAULT 0,
	`totalImages` int NOT NULL DEFAULT 0,
	`pdfUrl` text,
	`finalPdfUrl` text,
	`userFeedback` text,
	`status` enum('processing','ready_for_review','approved','sent_to_print') NOT NULL DEFAULT 'processing',
	`organizationType` enum('chronological','thematic'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `book_metadata_id` PRIMARY KEY(`id`),
	CONSTRAINT `book_metadata_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `daily_inspirations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` text NOT NULL,
	`category` varchar(100),
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_inspirations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `followup_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`memoryId` int,
	`categoryId` int,
	`question` text NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`answered` boolean NOT NULL DEFAULT false,
	`answerMemoryId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `followup_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`themes` text,
	`peopleMentioned` text,
	`periodMentioned` varchar(100),
	`processed` boolean NOT NULL DEFAULT false,
	`version` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`isPredefined` boolean NOT NULL DEFAULT false,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `memory_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memoryId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text,
	`type` enum('audio','text','document','photo') NOT NULL,
	`fileUrl` text,
	`fileKey` text,
	`fileName` varchar(255),
	`fileSize` int,
	`mimeType` varchar(100),
	`order` int NOT NULL DEFAULT 0,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `memory_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `kitActivatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `programEndDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `lastUploadDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `bookProcessingStarted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `bookReadyForReview` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `bookApproved` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `customMemoryCount` int DEFAULT 0 NOT NULL;