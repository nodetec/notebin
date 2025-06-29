"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
import { Textarea } from "~/components/ui/textarea";
import { useNostrProfile } from "~/hooks/useNostrProfile";
import { useUpdateProfile } from "~/hooks/useUpdateProfile";
import { verifyNip05 } from "~/lib/nostr/verifyNip05";
import { getAvatar } from "~/lib/utils";

const profileSchema = z.object({
  name: z.string().max(50).optional(),
  about: z.string().max(500).optional(),
  picture: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  github: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  nip05: z
    .string()
    .regex(/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, "Invalid NIP-05 format")
    .optional()
    .or(z.literal("")),
  lud16: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface AccountProfileProps {
  publicKey: string;
  secretKey?: string;
}

export function AccountProfile({ publicKey, secretKey }: AccountProfileProps) {
  const { data: profile, isLoading, error } = useNostrProfile(publicKey, true);
  const updateProfileMutation = useUpdateProfile(publicKey);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      about: "",
      picture: "",
      website: "",
      location: "",
      github: "",
      twitter: "",
      nip05: "",
      lud16: "",
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        about: profile.about || "",
        picture: profile.picture?.startsWith("data:")
          ? ""
          : profile.picture || "",
        website: profile.website || "",
        location: profile.location || "",
        github: profile.github || "",
        twitter: profile.twitter || "",
        nip05: profile.nip05 || "",
        lud16: profile.lud16 || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Verify NIP-05 if provided
      if (data.nip05 && data.nip05.trim()) {
        const verificationResult = await verifyNip05(
          data.nip05.trim(),
          publicKey,
        );
        if (!verificationResult.valid) {
          form.setError("nip05", {
            type: "manual",
            message: verificationResult.error || "NIP-05 verification failed",
          });
          return;
        }
      }

      await updateProfileMutation.mutateAsync({
        profileData: data,
        existingProfile: profile,
        secretKey,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const displayName = profile?.name || "Anonymous";
  const currentPicture =
    form.watch("picture") || profile?.picture || getAvatar(publicKey);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load profile. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Profile updated successfully! Changes may take a few moments to
            appear.
          </AlertDescription>
        </Alert>
      )}

      {updateProfileMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to update profile. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentPicture} alt={displayName} />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{displayName}</h3>
              <p className="font-mono text-muted-foreground text-sm">
                {profile?.shortNpub}
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="picture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/avatar.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use generated avatar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourwebsite.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub</FormLabel>
                      <FormControl>
                        <Input placeholder="username or full URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input placeholder="username or full URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nip05"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIP-05 Identifier</FormLabel>
                    <FormControl>
                      <Input placeholder="user@domain.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Verification identifier for your profile (will be verified
                      before saving)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lud16"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lightning Address</FormLabel>
                    <FormControl>
                      <Input placeholder="user@domain.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Email-style Lightning address for receiving payments
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {updateProfileMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {form.watch("nip05")
                        ? "Verifying NIP-05 and updating profile..."
                        : "Updating profile..."}
                    </span>
                    <span>Please wait</span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={updateProfileMutation.isPending}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
