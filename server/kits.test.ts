import { describe, it, expect } from "vitest";
import { 
  createKit,
  getUserKits,
  addKitMember,
  getKitMembers,
  activateKit,
  getKitById
} from "./db";

describe("Kits System", () => {
  describe("createKit", () => {
    it("should create a new kit with owner", async () => {
      const kit = await createKit({
        name: "Memórias da Vovó Maria",
        description: "Histórias de vida da Vovó Maria",
        ownerUserId: 1,
      });

      expect(kit).toBeDefined();
      expect(kit.name).toBe("Memórias da Vovó Maria");
      expect(kit.ownerUserId).toBe(1);
      expect(kit.activatedAt).toBeNull();
    });

    it("should automatically add owner as kit member", async () => {
      const kit = await createKit({
        name: "Teste Kit",
        ownerUserId: 1,
      });

      const members = await getKitMembers(kit.id);
      expect(members.length).toBeGreaterThan(0);
      
      const ownerMember = members.find(m => m.userId === 1);
      expect(ownerMember).toBeDefined();
      expect(ownerMember?.role).toBe("owner");
    });
  });

  describe("getUserKits", () => {
    it("should return kits where user is a member", async () => {
      const kits = await getUserKits(1);
      expect(Array.isArray(kits)).toBe(true);
    });
  });

  describe("addKitMember", () => {
    it("should add a collaborator to a kit", async () => {
      // First create a kit
      const kit = await createKit({
        name: "Test Kit for Members",
        ownerUserId: 1,
      });

      // Add a collaborator
      const member = await addKitMember({
        kitId: kit.id,
        userId: 2,
        role: "collaborator",
        invitedBy: 1,
      });

      expect(member).toBeDefined();
      expect(member.kitId).toBe(kit.id);
      expect(member.userId).toBe(2);
      expect(member.role).toBe("collaborator");
    });
  });

  describe("getKitMembers", () => {
    it("should return all members of a kit", async () => {
      const kit = await createKit({
        name: "Test Kit",
        ownerUserId: 1,
      });

      const members = await getKitMembers(kit.id);
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBeGreaterThan(0);
    });
  });

  describe("activateKit", () => {
    it("should activate kit and set period dates", async () => {
      const kit = await createKit({
        name: "Kit to Activate",
        ownerUserId: 1,
      });

      await activateKit(kit.id);

      const activatedKit = await getKitById(kit.id);
      expect(activatedKit).toBeDefined();
      expect(activatedKit?.activatedAt).not.toBeNull();
      expect(activatedKit?.memoryPeriodEndDate).not.toBeNull();
      expect(activatedKit?.bookFinalizationEndDate).not.toBeNull();
    });

    it("should set memory period to 90 days from activation", async () => {
      const kit = await createKit({
        name: "Kit Period Test",
        ownerUserId: 1,
      });

      await activateKit(kit.id);

      const activatedKit = await getKitById(kit.id);
      const activatedAt = activatedKit?.activatedAt;
      const memoryPeriodEnd = activatedKit?.memoryPeriodEndDate;

      if (activatedAt && memoryPeriodEnd) {
        const diffDays = Math.floor(
          (memoryPeriodEnd.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        expect(diffDays).toBeGreaterThanOrEqual(89);
        expect(diffDays).toBeLessThanOrEqual(91);
      }
    });
  });
});
