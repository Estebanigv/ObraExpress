"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";

export function NavbarDemo() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-2" />
      <p className="text-black dark:text-white">
        The Navbar will show on top of the page
      </p>
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Services">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/web-dev">Web Development</HoveredLink>
            <HoveredLink href="/interface-design">Interface Design</HoveredLink>
            <HoveredLink href="/seo">Search Engine Optimization</HoveredLink>
            <HoveredLink href="/branding">Branding</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Products">
          <div className="  text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Policarbonato Alveolar"
              href="/policarbonatos/alveolar"
              src="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop"
              description="Láminas de policarbonato con estructura alveolar para construcción."
            />
            <ProductItem
              title="Policarbonato Compacto"
              href="/policarbonatos/compacta"
              src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop"
              description="Policarbonato sólido resistente para aplicaciones industriales."
            />
            <ProductItem
              title="Rollos PVC"
              href="/rollos"
              src="https://images.unsplash.com/photo-1580500550469-fec3ca0d47c8?w=300&h=200&fit=crop"
              description="Rollos flexibles para cubiertas y techos industriales."
            />
            <ProductItem
              title="Perfiles y Accesorios"
              href="/perfiles"
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop"
              description="Perfiles de aluminio y accesorios para instalación."
            />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Pricing">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/hobby">Hobby</HoveredLink>
            <HoveredLink href="/individual">Individual</HoveredLink>
            <HoveredLink href="/team">Team</HoveredLink>
            <HoveredLink href="/enterprise">Enterprise</HoveredLink>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}