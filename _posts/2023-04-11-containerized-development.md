---
title: "Developing SLATE Using Containers"
overview: How to develop SLATE using containers
published: false
permalink: blog/2023-04-11-containerized-development.html
attribution: Suchandra Thapa
layout: post
type: markdown
tag: draft
---

The SLATE binaries and API server requires a fairly complex environment in order
to build successfully.  In order to provide a standardized build environment that 
can be reproducably used in various contexts, the SLATE project uses a 
containerized environment for development and for building binaries for production 
usage. We'll describe the environment and how we use it in this blog post.

<!--end_excerpt-->


## Background

The SLATE client and API server are both written as C++. Due to the various libraries
that the SLATE code base depend on, it can be difficult to setup and use.  This is 
especially the case when SLATE was based on Centos 7 and libraries that were significantly
older.  

In order to simplify development and deployment, we created a set of containers for compiling 
the various SLATE binaries and for running them in unit tests as well as in production.  

## Container Images

The SLATE binaries were initially targetted for Centos 7 and we started our initial steps at 
containerization with a Centos 7 image.  However for a variety of reasons, we decided to use 
Rocky Linux 9 as the basis for our containers as well as to update a few components to more 
recent versions.

Once we decided on a container image, we created a [Dockerfile](https://github.com/slateci/docker-images/blob/master/slate-client-server/Dockerfile)
based on Rocky Linux that included the libraries that SLATE requires to build. Initially, the most 
important of these are the AWS C++ SDK but we later added other libraries like OpenTelemetry.

Once we had a base container, we extended this to create the images that we would need for
developing SLATE, building the static client binaries, and for running the SLATE components. 

The development containers take the base container and adds packages for library headers, debuggers,
ssh (needed for CLion integration), profiling and the other dev tooling needed to run and test SLATE 
components.

## Running the Development Container and CLion Integration

The development container we use is available on the [OSG harbor instance](https://hub.opensciencegrid.org).  
When using podman, it can be obtained by running `podman pull hub.opensciencegrid.org/slate/slate-server-development:1.0.0`.
Then, it can be started up using 
`podman run -d --cap-add sys_ptrace -p127.0.0.1:2222:22 -p127.0.0.1:18080:18080 slate-server-development`.  You can verify that
the container is running correctly by running `ssh clionremote@localhost -p 2222`.  

After verifying that the container is running, Clion can be set to use the container to compile, run, and debug the SLATE code.
Behind the scenese, CLion will use ssh sync a copy of the SLATE source code onto the container and then run the various dev 
tools (gcc, cmake, gdb, etc) as needed to carry out tasks.  

In CLion, go to the settings and then the `Build, Execution, Toolchain` section.  Click on the plus sign and select `Remote Host`.  
Click the gear icon next to the `Credentials` field and you'll see a screen like the following:

<img src="/img/posts/clion-ssh.png"> 

Set the ssh configuration as shown.  Click on the `Test Connection` button to verify that things are working.  After hitting `OK` 
on the ssh configuration dialog, CLion should automatically pick up the various tools in the container (cmake, gmake, cc, c++, gdb).

Now go to the `CMake` section and configure the settings as shown. 

<img src="/img/posts/clion-cmake.png"> 

Finally go to the `Deployment` section and create a new deployment configured as follows:

<img src="/img/posts/clion-deployment.png"> 

Close the settings window and then build the project using the remote profile that you just created.  This should sync the
project files to the container and then use CMake to build the various project files.  


## More advanced debugging

This setup allows us to compile, run. and do basic debugging of the SLATE components.  However,
we need to make a few changes in order to do things like profile execution times and memory usage. 

On the host machine that will run the container, we need to run `sysctl -w kernel.perf_event_paranoid=1` in order
to allow users to get performance information about processes. Additionally, we'll 
need to change the podman invocation to 
`podman run -d --privileged --cap-add sys_ptrace --cap-add SYS_ADMIN -p127.0.0.1:2222:22 -p127.0.0.1:18080:18080  --security-opt seccomp=perf.json`
in order to run the container with elevated privileges.  The contents of the `perf.json` file are as follows:

```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "defaultErrnoRet": 1,
  "archMap": [
    {
      "architecture": "SCMP_ARCH_X86_64",
      "subArchitectures": [
        "SCMP_ARCH_X86",
        "SCMP_ARCH_X32"
      ]
    },
    {
      "architecture": "SCMP_ARCH_AARCH64",
      "subArchitectures": [
        "SCMP_ARCH_ARM"
      ]
    },
    {
      "architecture": "SCMP_ARCH_MIPS64",
      "subArchitectures": [
        "SCMP_ARCH_MIPS",
        "SCMP_ARCH_MIPS64N32"
      ]
    },
    {
      "architecture": "SCMP_ARCH_MIPS64N32",
      "subArchitectures": [
        "SCMP_ARCH_MIPS",
        "SCMP_ARCH_MIPS64"
      ]
    },
    {
      "architecture": "SCMP_ARCH_MIPSEL64",
      "subArchitectures": [
        "SCMP_ARCH_MIPSEL",
        "SCMP_ARCH_MIPSEL64N32"
      ]
    },
    {
      "architecture": "SCMP_ARCH_MIPSEL64N32",
      "subArchitectures": [
        "SCMP_ARCH_MIPSEL",
        "SCMP_ARCH_MIPSEL64"
      ]
    },
    {
      "architecture": "SCMP_ARCH_S390X",
      "subArchitectures": [
        "SCMP_ARCH_S390"
      ]
    },
    {
      "architecture": "SCMP_ARCH_RISCV64",
      "subArchitectures": null
    }
  ],
  "syscalls": [
    {
      "names": [
        "accept",
        "accept4",
        "access",
        "adjtimex",
        "alarm",
        "bind",
        "brk",
        "capget",
        "capset",
        "chdir",
        "chmod",
        "chown",
        "chown32",
        "clock_adjtime",
        "clock_adjtime64",
        "clock_getres",
        "clock_getres_time64",
        "clock_gettime",
        "clock_gettime64",
        "clock_nanosleep",
        "clock_nanosleep_time64",
        "close",
        "close_range",
        "connect",
        "copy_file_range",
        "creat",
        "dup",
        "dup2",
        "dup3",
        "epoll_create",
        "epoll_create1",
        "epoll_ctl",
        "epoll_ctl_old",
        "epoll_pwait",
        "epoll_pwait2",
        "epoll_wait",
        "epoll_wait_old",
        "eventfd",
        "eventfd2",
        "execve",
        "execveat",
        "exit",
        "exit_group",
        "faccessat",
        "faccessat2",
        "fadvise64",
        "fadvise64_64",
        "fallocate",
        "fanotify_mark",
        "fchdir",
        "fchmod",
        "fchmodat",
        "fchown",
        "fchown32",
        "fchownat",
        "fcntl",
        "fcntl64",
        "fdatasync",
        "fgetxattr",
        "flistxattr",
        "flock",
        "fork",
        "fremovexattr",
        "fsetxattr",
        "fstat",
        "fstat64",
        "fstatat64",
        "fstatfs",
        "fstatfs64",
        "fsync",
        "ftruncate",
        "ftruncate64",
        "futex",
        "futex_time64",
        "futex_waitv",
        "futimesat",
        "getcpu",
        "getcwd",
        "getdents",
        "getdents64",
        "getegid",
        "getegid32",
        "geteuid",
        "geteuid32",
        "getgid",
        "getgid32",
        "getgroups",
        "getgroups32",
        "getitimer",
        "getpeername",
        "getpgid",
        "getpgrp",
        "getpid",
        "getppid",
        "getpriority",
        "getrandom",
        "getresgid",
        "getresgid32",
        "getresuid",
        "getresuid32",
        "getrlimit",
        "get_robust_list",
        "getrusage",
        "getsid",
        "getsockname",
        "getsockopt",
        "get_thread_area",
        "gettid",
        "gettimeofday",
        "getuid",
        "getuid32",
        "getxattr",
        "inotify_add_watch",
        "inotify_init",
        "inotify_init1",
        "inotify_rm_watch",
        "io_cancel",
        "ioctl",
        "io_destroy",
        "io_getevents",
        "io_pgetevents",
        "io_pgetevents_time64",
        "ioprio_get",
        "ioprio_set",
        "io_setup",
        "io_submit",
        "io_uring_enter",
        "io_uring_register",
        "io_uring_setup",
        "ipc",
        "kill",
        "landlock_add_rule",
        "landlock_create_ruleset",
        "landlock_restrict_self",
        "lchown",
        "lchown32",
        "lgetxattr",
        "link",
        "linkat",
        "listen",
        "listxattr",
        "llistxattr",
        "_llseek",
        "lremovexattr",
        "lseek",
        "lsetxattr",
        "lstat",
        "lstat64",
        "madvise",
        "membarrier",
        "memfd_create",
        "memfd_secret",
        "mincore",
        "mkdir",
        "mkdirat",
        "mknod",
        "mknodat",
        "mlock",
        "mlock2",
        "mlockall",
        "mmap",
        "mmap2",
        "mprotect",
        "mq_getsetattr",
        "mq_notify",
        "mq_open",
        "mq_timedreceive",
        "mq_timedreceive_time64",
        "mq_timedsend",
        "mq_timedsend_time64",
        "mq_unlink",
        "mremap",
        "msgctl",
        "msgget",
        "msgrcv",
        "msgsnd",
        "msync",
        "munlock",
        "munlockall",
        "munmap",
        "nanosleep",
        "newfstatat",
        "_newselect",
        "open",
        "openat",
        "openat2",
        "pause",
        "perf_event_open",
        "pidfd_open",
        "pidfd_send_signal",
        "pipe",
        "pipe2",
        "pkey_alloc",
        "pkey_free",
        "pkey_mprotect",
        "poll",
        "ppoll",
        "ppoll_time64",
        "prctl",
        "pread64",
        "preadv",
        "preadv2",
        "prlimit64",
        "process_mrelease",
        "pselect6",
        "pselect6_time64",
        "pwrite64",
        "pwritev",
        "pwritev2",
        "read",
        "readahead",
        "readlink",
        "readlinkat",
        "readv",
        "recv",
        "recvfrom",
        "recvmmsg",
        "recvmmsg_time64",
        "recvmsg",
        "remap_file_pages",
        "removexattr",
        "rename",
        "renameat",
        "renameat2",
        "restart_syscall",
        "rmdir",
        "rseq",
        "rt_sigaction",
        "rt_sigpending",
        "rt_sigprocmask",
        "rt_sigqueueinfo",
        "rt_sigreturn",
        "rt_sigsuspend",
        "rt_sigtimedwait",
        "rt_sigtimedwait_time64",
        "rt_tgsigqueueinfo",
        "sched_getaffinity",
        "sched_getattr",
        "sched_getparam",
        "sched_get_priority_max",
        "sched_get_priority_min",
        "sched_getscheduler",
        "sched_rr_get_interval",
        "sched_rr_get_interval_time64",
        "sched_setaffinity",
        "sched_setattr",
        "sched_setparam",
        "sched_setscheduler",
        "sched_yield",
        "seccomp",
        "select",
        "semctl",
        "semget",
        "semop",
        "semtimedop",
        "semtimedop_time64",
        "send",
        "sendfile",
        "sendfile64",
        "sendmmsg",
        "sendmsg",
        "sendto",
        "setfsgid",
        "setfsgid32",
        "setfsuid",
        "setfsuid32",
        "setgid",
        "setgid32",
        "setgroups",
        "setgroups32",
        "setitimer",
        "setpgid",
        "setpriority",
        "setregid",
        "setregid32",
        "setresgid",
        "setresgid32",
        "setresuid",
        "setresuid32",
        "setreuid",
        "setreuid32",
        "setrlimit",
        "set_robust_list",
        "setsid",
        "setsockopt",
        "set_thread_area",
        "set_tid_address",
        "setuid",
        "setuid32",
        "setxattr",
        "shmat",
        "shmctl",
        "shmdt",
        "shmget",
        "shutdown",
        "sigaltstack",
        "signalfd",
        "signalfd4",
        "sigprocmask",
        "sigreturn",
        "socketcall",
        "socketpair",
        "splice",
        "stat",
        "stat64",
        "statfs",
        "statfs64",
        "statx",
        "symlink",
        "symlinkat",
        "sync",
        "sync_file_range",
        "syncfs",
        "sysinfo",
        "tee",
        "tgkill",
        "time",
        "timer_create",
        "timer_delete",
        "timer_getoverrun",
        "timer_gettime",
        "timer_gettime64",
        "timer_settime",
        "timer_settime64",
        "timerfd_create",
        "timerfd_gettime",
        "timerfd_gettime64",
        "timerfd_settime",
        "timerfd_settime64",
        "times",
        "tkill",
        "truncate",
        "truncate64",
        "ugetrlimit",
        "umask",
        "uname",
        "unlink",
        "unlinkat",
        "utime",
        "utimensat",
        "utimensat_time64",
        "utimes",
        "vfork",
        "vmsplice",
        "wait4",
        "waitid",
        "waitpid",
        "write",
        "writev"
      ],
      "action": "SCMP_ACT_ALLOW"
    },
    {
      "names": [
        "process_vm_readv",
        "process_vm_writev",
        "ptrace"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "minKernel": "4.8"
      }
    },
    {
      "names": [
        "socket"
      ],
      "action": "SCMP_ACT_ALLOW",
      "args": [
        {
          "index": 0,
          "value": 40,
          "op": "SCMP_CMP_NE"
        }
      ]
    },
    {
      "names": [
        "personality"
      ],
      "action": "SCMP_ACT_ALLOW",
      "args": [
        {
          "index": 0,
          "value": 0,
          "op": "SCMP_CMP_EQ"
        }
      ]
    },
    {
      "names": [
        "personality"
      ],
      "action": "SCMP_ACT_ALLOW",
      "args": [
        {
          "index": 0,
          "value": 8,
          "op": "SCMP_CMP_EQ"
        }
      ]
    },
    {
      "names": [
        "personality"
      ],
      "action": "SCMP_ACT_ALLOW",
      "args": [
        {
          "index": 0,
          "value": 131072,
          "op": "SCMP_CMP_EQ"
        }
      ]
    },
    {
      "names": [
        "personality"
      ],
      "action": "SCMP_ACT_ALLOW",
      "args": [
        {
          "index": 0,
          "value": 131080,
          "op": "SCMP_CMP_EQ"
        }
      ]
    },
    {
      "names": [
        "personality"
      ],
      "action": "SCMP_ACT_ALLOW",
      "args": [
        {
          "index": 0,
          "value": 4294967295,
          "op": "SCMP_CMP_EQ"
        }
      ]
    },
    {
      "names": [
        "sync_file_range2",
        "swapcontext"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "arches": [
          "ppc64le"
        ]
      }
    },
    {
      "names": [
        "arm_fadvise64_64",
        "arm_sync_file_range",
        "sync_file_range2",
        "breakpoint",
        "cacheflush",
        "set_tls"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "arches": [
          "arm",
          "arm64"
        ]
      }
    },
    {
      "names": [
        "arch_prctl"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "arches": [
          "amd64",
          "x32"
        ]
      }
    },
    {
      "names": [
        "modify_ldt"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "arches": [
          "amd64",
          "x32",
          "x86"
        ]
      }
    },
    {
      "names": [
        "s390_pci_mmio_read",
        "s390_pci_mmio_write",
        "s390_runtime_instr"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "arches": [
          "s390",
          "s390x"
        ]
      }
    },
    {
      "names": [
        "riscv_flush_icache"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "arches": [
          "riscv64"
        ]
      }
    },
    {
      "names": [
        "open_by_handle_at"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_DAC_READ_SEARCH"
        ]
      }
    },
    {
      "names": [
        "bpf",
        "clone",
        "clone3",
        "fanotify_init",
        "fsconfig",
        "fsmount",
        "fsopen",
        "fspick",
        "lookup_dcookie",
        "mount",
        "mount_setattr",
        "move_mount",
        "name_to_handle_at",
        "open_tree",
        "perf_event_open",
        "quotactl",
        "quotactl_fd",
        "setdomainname",
        "sethostname",
        "setns",
        "syslog",
        "umount",
        "umount2",
        "unshare"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_SYS_ADMIN"
        ]
      }
    },
    {
      "names": [
        "clone"
      ],
      "action": "SCMP_ACT_ALLOW",
      "args": [
        {
          "index": 0,
          "value": 2114060288,
          "op": "SCMP_CMP_MASKED_EQ"
        }
      ],
      "excludes": {
        "caps": [
          "CAP_SYS_ADMIN"
        ],
        "arches": [
          "s390",
          "s390x"
        ]
      }
    },
    {
      "names": [
        "clone"
      ],
      "action": "SCMP_ACT_ALLOW",
      "args": [
        {
          "index": 1,
          "value": 2114060288,
          "op": "SCMP_CMP_MASKED_EQ"
        }
      ],
      "comment": "s390 parameter ordering for clone is different",
      "includes": {
        "arches": [
          "s390",
          "s390x"
        ]
      },
      "excludes": {
        "caps": [
          "CAP_SYS_ADMIN"
        ]
      }
    },
    {
      "names": [
        "clone3"
      ],
      "action": "SCMP_ACT_ERRNO",
      "errnoRet": 38,
      "excludes": {
        "caps": [
          "CAP_SYS_ADMIN"
        ]
      }
    },
    {
      "names": [
        "reboot"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_SYS_BOOT"
        ]
      }
    },
    {
      "names": [
        "chroot"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_SYS_CHROOT"
        ]
      }
    },
    {
      "names": [
        "delete_module",
        "init_module",
        "finit_module"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_SYS_MODULE"
        ]
      }
    },
    {
      "names": [
        "acct"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_SYS_PACCT"
        ]
      }
    },
    {
      "names": [
        "kcmp",
        "pidfd_getfd",
        "process_madvise",
        "process_vm_readv",
        "process_vm_writev",
        "ptrace"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_SYS_PTRACE"
        ]
      }
    },
    {
      "names": [
        "iopl",
        "ioperm"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_SYS_RAWIO"
        ]
      }
    },
    {
      "names": [
        "settimeofday",
        "stime",
        "clock_settime",
        "clock_settime64"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_SYS_TIME"
        ]
      }
    },
    {
      "names": [
        "vhangup"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_SYS_TTY_CONFIG"
        ]
      }
    },
    {
      "names": [
        "get_mempolicy",
        "mbind",
        "set_mempolicy"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_SYS_NICE"
        ]
      }
    },
    {
      "names": [
        "syslog"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_SYSLOG"
        ]
      }
    },
    {
      "names": [
        "bpf"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_BPF"
        ]
      }
    },
    {
      "names": [
        "perf_event_open"
      ],
      "action": "SCMP_ACT_ALLOW",
      "includes": {
        "caps": [
          "CAP_PERFMON"
        ]
      }
    }
  ]
}

```


Once this is done, CLion should be able to trace the SLATE components.  Additionally, we can
use valgrind's massif profiler to get memory usage over time.

## Summary

We've briefly outlined how and why we use development containers to development, test, and 
run SLATE components.  We've also outlined how we configured CLion to use these containers
to improve our development process.

## Questions?

As always, we encourage you to try this out and let us know what's working, what's not, what 
can be improved and so on. For discussion, news and troubleshooting, 
the [SLATE Slack workspace](https://slack.slateci.io/) is the best place to reach us! 

