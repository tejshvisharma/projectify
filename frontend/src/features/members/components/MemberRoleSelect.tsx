import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLE_CONFIG, ASSIGNABLE_ROLES, type ProjectRole } from '../types';

interface MemberRoleSelectProps {
  currentRole: ProjectRole;
  memberId: string;
  onRoleChange: (memberId: string, newRole: ProjectRole) => void;
  disabled?: boolean;
}

export default function MemberRoleSelect({
  currentRole,
  memberId,
  onRoleChange,
  disabled = false,
}: MemberRoleSelectProps) {
  return (
    <Select
      value={currentRole}
      onValueChange={(value) =>
        onRoleChange(memberId, value as ProjectRole)
      }
      disabled={disabled}
    >
      <SelectTrigger className="h-7 w-32 text-xs border-none shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ASSIGNABLE_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            <span
              className={`
                text-xs font-medium px-2 py-0.5 rounded-full border
                ${ROLE_CONFIG[role].className}
              `}
            >
              {ROLE_CONFIG[role].label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}