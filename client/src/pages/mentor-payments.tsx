import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Calendar } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface PaymentPortfolioItem {
  menteeId: string;
  menteeName: string;
  totalFee: number;
  totalPaid: number;
  remaining: number;
  lastPaymentDate: string | null;
}

const addPaymentSchema = z.object({
  menteeId: z.string(),
  amount: z.string().min(1, "Amount is required"),
  date: z.string(),
  notes: z.string().optional(),
});

type AddPaymentFormData = z.infer<typeof addPaymentSchema>;

export default function MentorPayments() {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<PaymentPortfolioItem | null>(null);
  const { toast } = useToast();

  const { data: portfolio, isLoading } = useQuery<PaymentPortfolioItem[]>({
    queryKey: ["/api/mentor/payment-portfolio"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AddPaymentFormData>({
    resolver: zodResolver(addPaymentSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: (data: AddPaymentFormData) =>
      apiRequest("POST", "/api/mentor/add-payment", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentor/payment-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentor/stats"] });
      setIsAddPaymentOpen(false);
      setSelectedMentee(null);
      reset();
      toast({
        title: "Payment recorded!",
        description: "Payment has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to add payment",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: AddPaymentFormData) => {
    addPaymentMutation.mutate(data);
  };

  const openAddPayment = (mentee: PaymentPortfolioItem) => {
    setSelectedMentee(mentee);
    setValue("menteeId", mentee.menteeId);
    setIsAddPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Portfolio</h1>
        <p className="text-muted-foreground mt-2">
          Track fees and payments for all students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : portfolio && portfolio.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Total Fee</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.map((item) => (
                    <TableRow key={item.menteeId}>
                      <TableCell className="font-medium" data-testid={`text-student-${item.menteeId}`}>
                        {item.menteeName}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{item.totalFee.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono" data-testid={`text-paid-${item.menteeId}`}>
                        ₹{item.totalPaid.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={item.remaining === 0 ? "secondary" : "default"}
                          className="font-mono"
                          data-testid={`text-due-${item.menteeId}`}
                        >
                          ₹{item.remaining.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.lastPaymentDate
                          ? format(new Date(item.lastPaymentDate), "MMM d, yyyy")
                          : "No payments yet"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAddPayment(item)}
                          data-testid={`button-add-payment-${item.menteeId}`}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No students with payment information yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>
              Record a new payment from {selectedMentee?.menteeName}
            </DialogDescription>
          </DialogHeader>
          {selectedMentee && (
            <div className="rounded-lg bg-muted p-4 space-y-1 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Fee:</span>
                <span className="font-mono font-medium">₹{selectedMentee.totalFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="font-mono font-medium">₹{selectedMentee.totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span>Remaining:</span>
                <span className="font-mono">₹{selectedMentee.remaining.toLocaleString()}</span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("menteeId")} />
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="5000"
                data-testid="input-payment-amount"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Payment Date</Label>
              <Input
                id="date"
                type="date"
                data-testid="input-payment-date"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                data-testid="input-payment-notes"
                {...register("notes")}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={addPaymentMutation.isPending}
              data-testid="button-submit-payment"
            >
              {addPaymentMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
