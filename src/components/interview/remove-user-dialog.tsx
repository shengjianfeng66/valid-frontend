"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface RemoveUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userName?: string;
    onConfirm: () => void;
}

export function RemoveUserDialog({ open, onOpenChange, userName, onConfirm }: RemoveUserDialogProps) {
    const t = useTranslations('interview');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('confirmDialog.removeUser.title')}</DialogTitle>
                    <DialogDescription>
                        {t('confirmDialog.removeUser.description', { name: userName || '' })}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('confirmDialog.removeUser.cancel')}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-primary hover:bg-primary/90 text-white"
                    >
                        {t('confirmDialog.removeUser.confirm')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

