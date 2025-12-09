CREATE TABLE `question_boxes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`box` int NOT NULL,
	`boxName` varchar(100) NOT NULL,
	`number` int NOT NULL,
	`question` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `question_boxes_id` PRIMARY KEY(`id`)
);
