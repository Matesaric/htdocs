"use client";
import React from "react";

// Wiederverwendbarer Dialog für Bestätigungen (z.B. beim Löschen)
// Anzeigeoptionen: Titel, Fehlergrund, Beschriftungen für Knöpfe
// onConfirm ist optional, damit auch nur eine Information angezeigt werden kann

type Props = {
  title?: string;
  reason?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm?: () => void;
  children?: React.ReactNode;
};

export default function ConfirmModal({ title = "Löschen?", reason = null, confirmLabel = "Ja, löschen", cancelLabel = "Abbrechen", onCancel, onConfirm, children }: Props) {
  // Struktur des Overlays; Schachtelung für Zentrales Dialogfeld
  return (
    <div className="delete-dialog-overlay">
      <div className="delete-dialog">
        <h3>{title}</h3>

        {reason ? (
          <div className="delete-reason">
            <strong>Fehler beim Löschen:</strong>
            <br />
            {reason}
          </div>
        ) : (
          <>
            {children}
            <p style={{ color: "#666", fontSize: "13px" }}>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
          </>
        )}

        <div className="delete-dialog-buttons">
          <button className="delete-cancel-btn" onClick={onCancel}>{reason ? "Schliessen" : cancelLabel}</button>
          {!reason && onConfirm && (
            <button className="delete-confirm-btn" onClick={onConfirm}>{confirmLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
}
