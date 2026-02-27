import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface UserWithRole {
  id: string;
  nombre: string | null;
  email: string;
  created_at: string;
  role: "admin" | "user";
  role_row_id: string | null;
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Uses the SECURITY DEFINER function that reads auth.users for emails.
      // Admin-only: the function raises an error for non-admins.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("get_users_with_email");
      if (error) throw error;
      return (data ?? []) as UserWithRole[];
    },
  });

  const mutation = useMutation({
    mutationFn: async ({
      userId,
      newRole,
      roleRowId,
    }: {
      userId: string;
      newRole: "admin" | "user";
      roleRowId: string | null;
    }) => {
      if (roleRowId) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", roleRowId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario se actualizó correctamente.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Filter users by email or name based on search input
  const filtered = (users ?? []).filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.email.toLowerCase().includes(q) ||
      (u.nombre ?? "").toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
          style={{ color: "rgba(255,255,255,0.3)" }}
        />
        <input
          type="text"
          placeholder="Buscar por email o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm text-white placeholder-white/25 outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "2px",
            fontFamily: "'Barlow', sans-serif",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#CC1E1E")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
      </div>

      <div
        className="rounded-sm overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <TableHead
                className="text-xs uppercase tracking-widest"
                style={{ fontFamily: "'Oswald', sans-serif", color: "rgba(255,255,255,0.4)" }}
              >
                Nombre
              </TableHead>
              <TableHead
                className="text-xs uppercase tracking-widest"
                style={{ fontFamily: "'Oswald', sans-serif", color: "rgba(255,255,255,0.4)" }}
              >
                Email
              </TableHead>
              <TableHead
                className="text-xs uppercase tracking-widest"
                style={{ fontFamily: "'Oswald', sans-serif", color: "rgba(255,255,255,0.4)" }}
              >
                Rol
              </TableHead>
              <TableHead
                className="w-[160px] text-xs uppercase tracking-widest"
                style={{ fontFamily: "'Oswald', sans-serif", color: "rgba(255,255,255,0.4)" }}
              >
                Cambiar rol
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-sm py-8"
                  style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Barlow', sans-serif" }}
                >
                  {search ? "No se encontraron usuarios con ese criterio." : "No hay usuarios registrados."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <TableRow
                    key={u.id}
                    style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-medium text-sm text-white"
                          style={{ fontFamily: "'Barlow', sans-serif" }}
                        >
                          {u.nombre ?? "Sin nombre"}
                        </span>
                        {isSelf && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: "#CC1E1E",
                              color: "#CC1E1E",
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            Vos
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-sm"
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontFamily: "'Barlow', sans-serif",
                        }}
                      >
                        {u.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === "admin" ? "default" : "secondary"}
                        style={
                          u.role === "admin"
                            ? { background: "#CC1E1E", fontFamily: "'Oswald', sans-serif" }
                            : { fontFamily: "'Oswald', sans-serif" }
                        }
                      >
                        {u.role === "admin" ? "Admin" : "Usuario"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(val) =>
                          mutation.mutate({
                            userId: u.id,
                            newRole: val as "admin" | "user",
                            roleRowId: u.role_row_id,
                          })
                        }
                        disabled={isSelf || mutation.isPending}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p
        className="text-xs"
        style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Barlow', sans-serif" }}
      >
        {filtered.length} usuario{filtered.length !== 1 ? "s" : ""} encontrado
        {filtered.length !== 1 ? "s" : ""}
        {search ? ` para "${search}"` : ""}
      </p>
    </div>
  );
}
