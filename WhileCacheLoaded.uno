using Uno;
using Uno.Collections;
using Uno.UX;
using Fuse;
using Fuse.Triggers;

public class WhileCacheLoaded : WhileTrigger
{
        static PropertyHandle _whileCacheLoadedProp = Properties.CreateHandle();

        static bool IsCacheLoaded(Node n)
        {
                var v = n.Properties.Get(_whileCacheLoadedProp);
                if (!(v is bool)) return false;
                return (bool)v;
        }

        public static void SetState(Node n, bool cacheLoaded)
        {
                var v = IsCacheLoaded(n);
                if (v != cacheLoaded)
                {
                        n.Properties.Set(_whileCacheLoadedProp, cacheLoaded);
                        foreach (var b in n.Behaviors)
                        {
                                var wl = b as WhileCacheLoaded;
                                if (wl != null) { wl.SetActive(cacheLoaded); }
                        }
                }
        }

        protected override void OnRooted(Node parentNode)
        {
                base.OnRooted(parentNode);
                BypassSetActive(IsCacheLoaded(ParentNode));
        }
}