import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBulkMutation } from "@/shared/lib/useBulkMutation";
import { staffApi } from "../api/staff.api";
import type { StaffCreateInput, StaffInput, StaffListParams } from "../model/types";

const ALL = ["staff"] as const;

export function useStaffQuery(params: StaffListParams) {
  return useQuery({
    queryKey: [...ALL, "list", params],
    queryFn: () => staffApi.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ALL });
}

export function useCreateStaff() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: StaffCreateInput) => staffApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateStaff() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: StaffInput }) => staffApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteStaff() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => staffApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useResetStaffPassword() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => staffApi.resetPassword(id),
    onSuccess: invalidate,
  });
}

export function useBlockStaff() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, block }: { id: number; block: boolean }) =>
      block ? staffApi.block(id) : staffApi.unblock(id),
    onSuccess: invalidate,
  });
}

/** Blocks (true) or unblocks (false) every selected account; blocking yourself fails on its own. */
export function useBulkBlockStaff() {
  return useBulkMutation<boolean>(
    (id, block) => (block ? staffApi.block(id) : staffApi.unblock(id)),
    ALL,
  );
}
