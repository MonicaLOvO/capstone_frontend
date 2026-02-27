//I added centralized permission handling.
When adding action buttons (Add/Edit/Delete/View), please keep actions separated so we can wrap them with permission checks later using has("orders.xxx"). 


Use permission checks:

has("orders.create")
has("orders.edit")
has("orders.delete")