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

interface UserWithRole {
  id: string;
  nombre: string | null;
  created_at: string;
  role: "admin" | "user";
  role_row_id: string | null;
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("id, nombre, created_at")
        .order("created_at", { ascending: true });
      if (pError) throw pError;

      // Get all roles
      const { data: roles, error: rError } = await supabase
        .from("user_roles")
        .select("id, user_id, role");
      if (rError) throw rError;

      const roleMap = new Map(roles?.map((r) => [r.user_id, { role: r.role, id: r.id }]));

      return (profiles ?? []).map((p) => {
        const roleInfo = roleMap.get(p.id);
        return {
          id: p.id,
          nombre: p.nombre,
          created_at: p.created_at,
          role: (roleInfo?.role ?? "user") as "admin" | "user",
          role_row_id: roleInfo?.id ?? null,
        } satisfies UserWithRole;
      });
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ userId, newRole, roleRowId }: { userId: string; newRole: "admin" | "user"; roleRowId: string | null }) => {
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
      toast({ title: "Rol actualizado", description: "El rol del usuario se actualizó correctamente." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
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
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Rol actual</TableHead>
            <TableHead className="w-[180px]">Cambiar rol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((u) => {
            const isSelf = u.id === currentUser?.id;
            return (
              <TableRow key={u.id}>
                <TableCell>
                  <div>
                    <span className="font-medium">{u.nombre ?? "Sin nombre"}</span>
                    {isSelf && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Tú
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>
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
          })}
        </TableBody>
      </Table>
    </div>
  );
}
