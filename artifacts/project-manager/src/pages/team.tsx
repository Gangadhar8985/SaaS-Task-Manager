import { useState } from "react";
import { useListMembers, useCreateMember, useDeleteMember } from "@/hooks/use-members";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Shield, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function Team() {
  const { data: members = [], isLoading } = useListMembers();
  const deleteMember = useDeleteMember();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Team Members</h1>
          <p className="text-slate-500 mt-2">Manage who has access to your workspace.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl px-6 bg-slate-900 hover:bg-slate-800 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Invite Team Member</DialogTitle>
            </DialogHeader>
            <AddMemberForm onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <Card key={member.id} className="p-6 rounded-2xl border-slate-200 shadow-sm hover:shadow-lg transition-all bg-white relative group overflow-hidden">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    if(confirm(`Remove ${member.name}?`)) deleteMember.mutate({ id: member.id });
                  }}
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16 border-2 border-white shadow-md ring-1 ring-slate-100">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-indigo-50 text-primary font-display font-bold text-lg">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{member.name}</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <Shield className="w-3.5 h-3.5 mr-1" />
                    {member.role || "Member"}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center text-sm text-slate-600 mb-2">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" />
                  {member.email}
                </div>
                <div className="text-xs text-slate-400 mt-3 font-medium">
                  Joined {format(new Date(member.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddMemberForm({ onSuccess }: { onSuccess: () => void }) {
  const createMember = useCreateMember();
  const [formData, setFormData] = useState({ name: "", email: "", role: "Member" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMember.mutate({ data: formData }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input 
          value={formData.name}
          onChange={e => setFormData(p => ({...p, name: e.target.value}))}
          placeholder="e.g. Alex Johnson"
          className="rounded-xl h-11"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Email Address</Label>
        <Input 
          type="email"
          value={formData.email}
          onChange={e => setFormData(p => ({...p, email: e.target.value}))}
          placeholder="alex@company.com"
          className="rounded-xl h-11"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Input 
          value={formData.role}
          onChange={e => setFormData(p => ({...p, role: e.target.value}))}
          placeholder="e.g. Designer, Engineer"
          className="rounded-xl h-11"
        />
      </div>
      <div className="pt-4">
        <Button type="submit" disabled={createMember.isPending} className="w-full rounded-xl h-11 font-semibold">
          {createMember.isPending ? "Sending Invite..." : "Send Invite"}
        </Button>
      </div>
    </form>
  );
}
